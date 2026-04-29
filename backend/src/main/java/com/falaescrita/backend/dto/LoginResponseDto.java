package com.falaescrita.backend.dto;

public record LoginResponseDto(
        String token,
        String username
) {
}
