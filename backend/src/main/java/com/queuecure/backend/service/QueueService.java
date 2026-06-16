package com.queuecure.backend.service;

import com.queuecure.backend.dto.QueueEntryDTO;
import com.queuecure.backend.dto.QueueStateDTO;
import com.queuecure.backend.dto.QueueStatsDTO;
import com.queuecure.backend.model.ConsultationLog;
import com.queuecure.backend.model.QueueEntry;
import com.queuecure.backend.model.QueueStatus;
import com.queuecure.backend.repository.ConsultationRepository;
import com.queuecure.backend.repository.QueueEntryRepository;
import com.queuecure.backend.websocket.QueueBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueueService {
    private final QueueEntryRepository queueEntryRepository;
    private final ConsultationRepository consultationRepository;
    private final WaitTimeService waitTimeService;
    private final QueueBroadcaster broadcaster;

    @Transactional(readOnly = true)
    public QueueStateDTO getFullSnapshot() {
        return buildSnapshot();
    }

    @Transactional
    public QueueStateDTO checkIn(String patientName) {
        QueueEntry entry = new QueueEntry();
        entry.setPatientName(patientName);
        entry.setStatus(QueueStatus.WAITING);
        entry.setCheckInTime(LocalDateTime.now());

        int nextToken = queueEntryRepository.findMaxTokenNumber()
                .map(max -> max + 1)
                .orElse(1);
        entry.setTokenNumber(nextToken);
        queueEntryRepository.save(entry);

        QueueStateDTO snapshot = buildSnapshot();
        broadcaster.broadcast(snapshot);
        return snapshot;
    }

    @Transactional
    public Optional<QueueStateDTO> callNext() {
        Optional<QueueEntry> next = queueEntryRepository.findNextWaitingForUpdate();

        if (next.isEmpty()) {
            return Optional.empty();
        }

        QueueEntry entry = next.get();
        entry.setStatus(QueueStatus.IN_PROGRESS);
        entry.setStartTime(LocalDateTime.now());
        queueEntryRepository.save(entry);

        QueueStateDTO snapshot = buildSnapshot();
        broadcaster.broadcast(snapshot);
        return Optional.of(snapshot);
    }

    @Transactional
    public QueueStateDTO markDone(UUID id) {
        QueueEntry entry = queueEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found: "+ id));

        entry.setStatus(QueueStatus.DONE);
        entry.setEndTime(LocalDateTime.now());
        queueEntryRepository.save(entry);

        if (entry.getStartTime() != null) {
            int durationSeconds = (int) ChronoUnit.SECONDS.between(entry.getStartTime(), entry.getEndTime());
            ConsultationLog log = new ConsultationLog();
            log.setDurationSeconds(durationSeconds);
            log.setRecordedAt(LocalDateTime.now());
            consultationRepository.save(log);

            waitTimeService.recordConsultDuration(durationSeconds);
        }

        QueueStateDTO snapshot = buildSnapshot();
        broadcaster.broadcast(snapshot);
        return snapshot;
    }

    public QueueStateDTO markNoShow(UUID id) {
        QueueEntry entry = queueEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + id));

        entry.setStatus(QueueStatus.NO_SHOW);
        entry.setEndTime(LocalDateTime.now());
        queueEntryRepository.save(entry);

        QueueStateDTO snapshot = buildSnapshot();
        broadcaster.broadcast(snapshot);
        return snapshot;
    }

    private QueueStateDTO buildSnapshot() {
        List<QueueEntry> allEntries = queueEntryRepository.findAllByOrderByTokenNumberAsc();

        //Count stats
        long totalWaiting = allEntries.stream().filter(e -> e.getStatus() == QueueStatus.WAITING).count();
        long inProgress = allEntries.stream().filter(e -> e.getStatus() == QueueStatus.IN_PROGRESS).count();
        long done = allEntries.stream().filter(e -> e.getStatus() == QueueStatus.DONE).count();
        long noShows = allEntries.stream().filter(e -> e.getStatus() == QueueStatus.NO_SHOW).count();
        long totalProcessed = done + noShows;

        double avgMinutes = waitTimeService.getRollingAverageMinutes();

        int waitPosition = 0;
        List<QueueEntryDTO> dtoList = new ArrayList<>();
        for (QueueEntry entry: allEntries) {
            QueueEntryDTO dto = new QueueEntryDTO();
            dto.setId(entry.getId());
            dto.setPatientName(entry.getPatientName());
            dto.setTokenNumber(entry.getTokenNumber());
            dto.setStatus(entry.getStatus());
            dto.setCheckInTime(entry.getCheckInTime());
            dto.setStartTime(entry.getStartTime());
            dto.setEndTime(entry.getEndTime());

            if (entry.getStatus() == QueueStatus.WAITING) {
                waitPosition++;
                int waitMins = (int) Math.ceil(
                        waitTimeService.computeWaitMinutes(waitPosition, totalProcessed, noShows)
                );
                dto.setEstimatedWaitMinutes(waitMins);
            } else {
                dto.setEstimatedWaitMinutes(0);
            }
            dtoList.add(dto);
        }

        QueueStatsDTO stats = new QueueStatsDTO(
                totalWaiting, inProgress, Math.round(avgMinutes * 10.0) / 10.0,
                Math.round(waitTimeService.computeWaitMinutes(1, totalProcessed, noShows) * 10.0) / 10.0
        );

        return new QueueStateDTO(dtoList, stats, "LIVE");
    }
}
