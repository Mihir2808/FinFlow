package com.finflow.auth.api.dto;

import com.finflow.auth.application.result.AuthResult;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String email,
        String accessToken,
        String refreshToken,
        String tokenType
) {

    public static AuthResponse from(AuthResult result) {
        return new AuthResponse(
                result.userId(),
                result.email(),
                result.accessToken(),
                result.refreshToken(),
                "Bearer"
        );
    }
}
