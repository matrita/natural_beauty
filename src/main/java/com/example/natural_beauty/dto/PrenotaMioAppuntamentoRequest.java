package com.example.natural_beauty.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record PrenotaMioAppuntamentoRequest(
        @NotNull Long operatoreId,
        @NotNull Long trattamentoId,
        @NotNull @FutureOrPresent(message = "La data deve essere oggi o nel futuro") LocalDateTime dataOraInizio,
        @Size(max = 2000) String note) {}

