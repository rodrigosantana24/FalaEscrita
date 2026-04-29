package com.falaescrita.backend.service;

import com.falaescrita.backend.dto.LoginRequestDto;
import com.falaescrita.backend.dto.LoginResponseDto;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    public LoginResponseDto login(LoginRequestDto request) {
        if (request == null || isBlank(request.username())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username e obrigatorio.");
        }

        if (isBlank(request.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password e obrigatorio.");
        }

        String rawToken = request.username() + ":" + Instant.now().toString();
        String encodedToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(rawToken.getBytes(StandardCharsets.UTF_8));

        return new LoginResponseDto("demo-" + encodedToken, request.username());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
