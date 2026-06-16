package com.queuecure.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QueueStatsDTO {
    private long totalWaiting;
    private long currentlyInProgress;
    private double avgConsultMinutes;
    private double estimatedNextWaitMinutes;
}
