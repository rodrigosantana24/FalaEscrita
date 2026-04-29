package com.falaescrita.backend.service;

import com.falaescrita.backend.dto.AudioChunkDto;
import com.falaescrita.backend.dto.TranscriptMessageDto;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class TranscriptionService {

    private final Map<String, AtomicLong> sequencesByMeeting = new ConcurrentHashMap<>();

    public TranscriptMessageDto transcribe(String meetingId, AudioChunkDto chunk) {
        String resolvedMeetingId = resolveMeetingId(meetingId, chunk);
        long sequence = resolveSequence(resolvedMeetingId, chunk.sequence());
        int estimatedBytes = estimateAudioBytes(chunk.audioBase64());

        String transcriptText = "Trecho " + sequence + " recebido (" + estimatedBytes
                + " bytes de audio) para a reuniao " + resolvedMeetingId + ".";

        return new TranscriptMessageDto(
                resolvedMeetingId,
                sequence,
                true,
                transcriptText,
                Instant.now()
        );
    }

    private String resolveMeetingId(String meetingId, AudioChunkDto chunk) {
        if (chunk.meetingId() != null && !chunk.meetingId().isBlank()) {
            return chunk.meetingId();
        }
        return meetingId;
    }

    private long resolveSequence(String meetingId, Long sequence) {
        if (sequence != null) {
            return sequence;
        }
        return sequencesByMeeting.computeIfAbsent(meetingId, id -> new AtomicLong(0)).incrementAndGet();
    }

    private int estimateAudioBytes(String audioBase64) {
        if (audioBase64 == null || audioBase64.isBlank()) {
            return 0;
        }
        return (audioBase64.length() * 3) / 4;
    }
}
