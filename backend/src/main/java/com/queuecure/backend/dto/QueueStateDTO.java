package com.queuecure.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QueueStateDTO {
    private List<QueueEntryDTO> entries;
    private QueueStatsDTO stats;
    private String connectionStatus;
}
