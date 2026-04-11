package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.CambiaMiaPasswordRequest;
import com.example.natural_beauty.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/account")
@Tag(name = "Mio Account", description = "Operazioni sull'account dell'utente autenticato")
@SecurityRequirement(name = "bearerAuth")
public class MeAccountController {

    private static final Logger log = LoggerFactory.getLogger(MeAccountController.class);
    private final AccountService accountService;

    public MeAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cambia la mia password", description = "Permette all'utente autenticato di modificare la propria password fornendo quella attuale.")
    public void cambiaPassword(
            @AuthenticationPrincipal UserDetails user, 
            @RequestBody @Valid CambiaMiaPasswordRequest request) {
        log.info("L'utente {} sta tentando di cambiare la propria password", user.getUsername());
        accountService.cambiaMiaPassword(user.getUsername(), request.vecchiaPassword(), request.nuovaPassword());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('CLIENTE')")
    @Operation(summary = "Cancella il mio account", description = "Elimina definitivamente l'utenza e tutti i dati associati (solo per CLIENTE).")
    public void cancella(@AuthenticationPrincipal UserDetails user) {
        log.warn("L'utente {} ha richiesto la cancellazione definitiva dell'account", user.getUsername());
        accountService.cancellaUtenza(user.getUsername());
    }
}
