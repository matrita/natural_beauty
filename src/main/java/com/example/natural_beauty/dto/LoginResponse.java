package com.example.natural_beauty.dto;

public record LoginResponse(String token, String tokenType, long expiresInSeconds, String email, String ruolo) {

    public static LoginResponse of(String token, long expiresInSeconds, String email, String ruolo) {
        return new LoginResponse(token, "Bearer", expiresInSeconds, email, ruolo);
    }
}
