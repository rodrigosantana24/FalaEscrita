package com.falaescrita.backend.dto;

public record LoginRequestDto(
        String username,
        String password
) {
}
