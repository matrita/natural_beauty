package com.example.natural_beauty.controller;

import com.example.natural_beauty.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint per cancellare la propria utenza.
 *
 * <p>Autorizzazione: solo utenti autenticati (nel nostro setup, il path {@code /api/me/**} e' riservato al ruolo
 * {@code CLIENTE}).
 */
@RestController
@RequestMapping("/api/me/account")
public class MeAccountController {

    private final AccountService accountService;

    public MeAccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /** Cancella definitivamente l'account dell'utente autenticato. */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancella(@AuthenticationPrincipal UserDetails user) {
        accountService.cancellaUtenza(user.getUsername());
    }
}

