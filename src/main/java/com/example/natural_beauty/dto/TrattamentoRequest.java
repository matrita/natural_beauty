package com.example.natural_beauty.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TrattamentoRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotNull @Min(5) int durataMinuti,
        @NotNull @DecimalMin("0.01") BigDecimal prezzo,
        @Size(max = 2000) String descrizione,
        Boolean attivo) {}
