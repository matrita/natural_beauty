package com.example.natural_beauty.dto;

import com.example.natural_beauty.model.StatoAppuntamento;
import jakarta.validation.constraints.NotNull;

public record AggiornaStatoAppuntamentoRequest(@NotNull StatoAppuntamento stato) {}
