package com.example.natural_beauty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AggiornaPasswordUtenteRequest(@NotBlank @Size(min = 4, max = 100) String password) {}

