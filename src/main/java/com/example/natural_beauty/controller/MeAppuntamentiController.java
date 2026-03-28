package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.dto.PrenotaMioAppuntamentoRequest;
import com.example.natural_beauty.service.AppuntamentoService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint "area cliente": permette al ruolo {@code CLIENTE} di gestire i propri appuntamenti.
 *
 * <p>La relazione cliente-utente viene risolta tramite l'email dell'utente autenticato (JWT {@code sub}).
 */
@RestController
@RequestMapping("/api/me/appuntamenti")
public class MeAppuntamentiController {

    private final AppuntamentoService appuntamentoService;

    public MeAppuntamentiController(AppuntamentoService appuntamentoService) {
        this.appuntamentoService = appuntamentoService;
    }

    /** Lista degli appuntamenti del cliente autenticato nel periodo richiesto. */
    @GetMapping
    public List<AppuntamentoResponse> nelPeriodo(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime da,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime a) {
        return appuntamentoService.trovaMieiNelPeriodo(user.getUsername(), da, a);
    }

    /** Prenotazione di un appuntamento per il cliente autenticato. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppuntamentoResponse prenota(
            @AuthenticationPrincipal UserDetails user, @RequestBody @Valid PrenotaMioAppuntamentoRequest request) {
        return appuntamentoService.prenotaComeCliente(user.getUsername(), request);
    }

    /** Cancellazione di un appuntamento del cliente autenticato (imposta stato {@code CANCELLATO}). */
    @DeleteMapping("/{id}")
    public AppuntamentoResponse cancella(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        return appuntamentoService.cancellaMio(user.getUsername(), id);
    }
}
