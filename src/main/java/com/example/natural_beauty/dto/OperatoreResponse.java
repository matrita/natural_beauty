package com.example.natural_beauty.dto;

public record OperatoreResponse(
        Long id, String nome, String cognome, String specializzazioni, boolean attivo) {}
