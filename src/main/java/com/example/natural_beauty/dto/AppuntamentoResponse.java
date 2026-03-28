package com.example.natural_beauty.dto;

import com.example.natural_beauty.model.StatoAppuntamento;
import java.time.LocalDateTime;

public record AppuntamentoResponse(
        Long id,
        Long clienteId,
        String clienteNomeCompleto,
        Long operatoreId,
        String operatoreNomeCompleto,
        Long trattamentoId,
        String trattamentoNome,
        int trattamentoDurataMinuti,
        LocalDateTime dataOraInizio,
        StatoAppuntamento stato,
        String note) {}
