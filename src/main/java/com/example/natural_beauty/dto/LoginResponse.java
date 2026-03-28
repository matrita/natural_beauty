package com.example.natural_beauty.dto;

public record LoginResponse(
    String token, 
    String tokenType, 
    long expiresInSeconds, 
    String email, 
    String ruolo,
    String nome,
    String cognome
) {

    public static LoginResponse of(String token, long expiresInSeconds, String email, String ruolo, String nome, String cognome) {
        return new LoginResponse(token, "Bearer", expiresInSeconds, email, ruolo, nome, cognome);
    }
}
