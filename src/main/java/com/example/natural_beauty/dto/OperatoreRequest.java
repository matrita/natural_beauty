package com.example.natural_beauty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OperatoreRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Size(max = 100) String cognome,
        @Size(max = 500) String specializzazioni,
        Boolean attivo) {}
