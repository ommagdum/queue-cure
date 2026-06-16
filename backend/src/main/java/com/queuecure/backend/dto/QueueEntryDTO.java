package com.queuecure.backend.dto;

import com.queuecure.backend.model.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QueueEntryDTO {

    private UUID id;
    private String patientName;
    private Integer tokenNumber;
    private QueueStatus status;
    private LocalDateTime checkInTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer estimatedWaitMinutes;
}
