package com.example.natural_beauty.dto;

import com.example.natural_beauty.model.UtenteRuolo;
import jakarta.validation.constraints.NotNull;

public record AggiornaRuoloUtenteRequest(@NotNull UtenteRuolo ruolo) {}

