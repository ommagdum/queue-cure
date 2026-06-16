package com.queuecure.backend.websocket;

import com.queuecure.backend.dto.QueueStateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QueueBroadcaster {
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(QueueStateDTO state) {
        messagingTemplate.convertAndSend("/topic/queue-updates", state);
    }
}
