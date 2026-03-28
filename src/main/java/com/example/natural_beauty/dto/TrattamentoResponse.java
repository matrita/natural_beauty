package com.example.natural_beauty.dto;

import java.math.BigDecimal;

public record TrattamentoResponse(
        Long id,
        String nome,
        int durataMinuti,
        BigDecimal prezzo,
        String descrizione,
        boolean attivo) {}
