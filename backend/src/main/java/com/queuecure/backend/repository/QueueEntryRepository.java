package com.queuecure.backend.repository;

import com.queuecure.backend.model.QueueEntry;
import com.queuecure.backend.model.QueueStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {
    List<QueueEntry> findAllByOrderByTokenNumberAsc(); // all entries sorted by token number

    @Query("SELECT MAX(q.tokenNumber) FROM QueueEntry q")
    Optional<Integer> findMaxTokenNumber(); // find highest token number assigned so far.

    long countByStatus(QueueStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM QueueEntry q WHERE q.status = 'WAITING' ORDER BY q.tokenNumber ASC LIMIT 1")
    Optional<QueueEntry> findNextWaitingForUpdate();

}
