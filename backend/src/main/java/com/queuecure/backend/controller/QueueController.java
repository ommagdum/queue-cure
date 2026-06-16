package com.queuecure.backend.controller;

import com.queuecure.backend.dto.QueueStateDTO;
import com.queuecure.backend.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/queue")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QueueController {
    private final QueueService queueService;

    @GetMapping("/")
    public ResponseEntity<QueueStateDTO> getQueue() {
        return ResponseEntity.ok(queueService.getFullSnapshot());
    }

    @PostMapping("/checkin")
    public ResponseEntity<QueueStateDTO> checkIn(@RequestBody Map<String, String> body) {
        String patientName = body.get("patientName");
        return ResponseEntity.ok(queueService.checkIn(patientName));
    }

    @PostMapping("/call-next")
    public ResponseEntity<QueueStateDTO> callNext() {
        return queueService.callNext()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/done")
    public ResponseEntity<QueueStateDTO> markDone(@PathVariable UUID id) {
        return ResponseEntity.ok(queueService.markDone(id));
    }

    @PostMapping("/{id}/no-show")
    public ResponseEntity<QueueStateDTO> markNoShow(@PathVariable UUID id) {
        return ResponseEntity.ok(queueService.markNoShow(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(queueService.getFullSnapshot().getStats());
    }

}
