package com.example.natural_beauty.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Size(max = 100) String cognome,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 30) String telefono,
        @Size(max = 2000) String note) {}
