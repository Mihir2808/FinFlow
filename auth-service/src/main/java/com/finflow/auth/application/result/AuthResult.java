package com.finflow.auth.application.result;

import java.util.UUID;

public record AuthResult(UUID userId, String email, String accessToken, String refreshToken) {}
