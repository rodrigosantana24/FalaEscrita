package com.falaescrita.backend.dto;

import java.time.Instant;

public record MeetingDto(
        String id,
        String title,
        String status,
        Instant startedAt
) {
}
