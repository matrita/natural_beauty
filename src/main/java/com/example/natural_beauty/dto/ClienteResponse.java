package com.example.natural_beauty.dto;

public record ClienteResponse(
        Long id, String nome, String cognome, String email, String telefono, String note) {}
