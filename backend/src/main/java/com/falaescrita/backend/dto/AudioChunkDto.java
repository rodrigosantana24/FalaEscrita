package com.falaescrita.backend.dto;

import java.time.Instant;

public record AudioChunkDto(
        String meetingId,
        Long sequence,
        String mimeType,
        String audioBase64,
        Instant capturedAt
) {
}
