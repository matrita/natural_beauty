package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.AggiornaPasswordUtenteRequest;
import com.example.natural_beauty.dto.AggiornaRuoloUtenteRequest;
import com.example.natural_beauty.dto.CreaUtenteRequest;
import com.example.natural_beauty.dto.UtenteResponse;
import com.example.natural_beauty.service.UtenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/utenti")
@Tag(name = "Utenti", description = "Gestione account di sistema (solo ADMIN)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class UtenteController {

    private static final Logger log = LoggerFactory.getLogger(UtenteController.class);
    private final UtenteService utenteService;

    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }

    @GetMapping
    @Operation(summary = "Elenco utenti", description = "Recupera la lista di tutti gli account registrati nel sistema.")
    public List<UtenteResponse> elenco() {
        return utenteService.trovaTutti();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crea utente staff/admin", description = "Permette di creare nuovi account di tipo STAFF o ADMIN.")
    public UtenteResponse crea(@RequestBody @Valid CreaUtenteRequest request) {
        log.info("Creazione nuovo utente di sistema: {}", request.email());
        return utenteService.crea(request);
    }

    @PatchMapping("/{id}/ruolo")
    @Operation(summary = "Cambia ruolo utente", description = "Modifica il livello di accesso di un utente esistente.")
    public UtenteResponse aggiornaRuolo(
            @PathVariable Long id, @RequestBody @Valid AggiornaRuoloUtenteRequest request) {
        log.info("Cambio ruolo per utente id={} in {}", id, request.ruolo());
        return utenteService.aggiornaRuolo(id, request.ruolo());
    }

    @PostMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reimposta password", description = "Permette all'amministratore di forzare il reset della password di un utente.")
    public void aggiornaPassword(
            @PathVariable Long id, @RequestBody @Valid AggiornaPasswordUtenteRequest request) {
        log.warn("Reset password richiesto per utente id={}", id);
        utenteService.aggiornaPassword(id, request.password());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina utente", description = "Rimuove definitivamente un account dal sistema.")
    public void elimina(@PathVariable Long id) {
        log.warn("Eliminazione definitiva utente id={}", id);
        utenteService.elimina(id);
    }
}
