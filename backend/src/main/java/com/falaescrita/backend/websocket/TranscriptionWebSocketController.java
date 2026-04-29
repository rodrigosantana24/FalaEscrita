package com.falaescrita.backend.websocket;

import com.falaescrita.backend.dto.AudioChunkDto;
import com.falaescrita.backend.dto.TranscriptMessageDto;
import com.falaescrita.backend.service.TranscriptionService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class TranscriptionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final TranscriptionService transcriptionService;

    public TranscriptionWebSocketController(
            SimpMessagingTemplate messagingTemplate,
            TranscriptionService transcriptionService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.transcriptionService = transcriptionService;
    }

    @MessageMapping("/chat/{meetingId}")
    public void handleAudioChunk(
            @DestinationVariable String meetingId,
            AudioChunkDto audioChunk
    ) {
        if (audioChunk == null) {
            throw new IllegalArgumentException("Payload de audio nao pode ser nulo.");
        }

        TranscriptMessageDto transcript = transcriptionService.transcribe(meetingId, audioChunk);
        messagingTemplate.convertAndSend("/topic/transcripts/" + transcript.meetingId(), transcript);
    }
}
