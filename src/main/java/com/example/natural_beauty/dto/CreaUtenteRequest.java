package com.example.natural_beauty.dto;

import com.example.natural_beauty.model.UtenteRuolo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreaUtenteRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 4, max = 100) String password,
        @NotNull UtenteRuolo ruolo) {}

