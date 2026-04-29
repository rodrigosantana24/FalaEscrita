package com.falaescrita.backend.dto;

import java.time.Instant;

public record TranscriptMessageDto(
        String meetingId,
        Long sequence,
        boolean partial,
        String text,
        Instant emittedAt
) {
}
