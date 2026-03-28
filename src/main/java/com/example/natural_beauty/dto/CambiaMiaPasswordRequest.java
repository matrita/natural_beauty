package com.example.natural_beauty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiaMiaPasswordRequest(
    @NotBlank String vecchiaPassword,
    @NotBlank @Size(min = 4, max = 100) String nuovaPassword
) {}
