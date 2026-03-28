package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.AggiornaStatoAppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.service.AppuntamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appuntamenti")
@Tag(name = "Appuntamenti", description = "Endpoint per la gestione delle prenotazioni e disponibilità")
@SecurityRequirement(name = "bearerAuth") // Tutti i metodi in questo controller richiedono JWT
public class AppuntamentoController {

    private static final Logger log = LoggerFactory.getLogger(AppuntamentoController.class);
    private final AppuntamentoService appuntamentoService;

    public AppuntamentoController(AppuntamentoService appuntamentoService) {
        this.appuntamentoService = appuntamentoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lista appuntamenti nel periodo", description = "Recupera tutti gli appuntamenti (compresi dettagli cliente e operatore) in un arco temporale.")
    public List<AppuntamentoResponse> nelPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime da,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime a) {
        log.debug("Richiesta lista appuntamenti da {} a {}", da, a);
        return appuntamentoService.trovaNelPeriodo(da, a);
    }

    @GetMapping("/disponibilita")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Calcola slot disponibili", description = "Restituisce una lista di orari (LocalDateTime) in cui l'operatore è libero per il trattamento selezionato.")
    public List<LocalDateTime> disponibilita(
            @RequestParam Long operatoreId,
            @RequestParam Long trattamentoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime da,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime a,
            @RequestParam(required = false, defaultValue = "15") int stepMinuti) {
        return appuntamentoService.disponibilita(operatoreId, trattamentoId, da, a, stepMinuti);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Dettaglio appuntamento", description = "Recupera le informazioni complete di un singolo appuntamento tramite ID.")
    public AppuntamentoResponse dettaglio(@PathVariable Long id) {
        return appuntamentoService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Crea prenotazione (Staff)", description = "Permette allo staff di creare una prenotazione per un cliente specifico.")
    public AppuntamentoResponse prenota(@RequestBody @Valid AppuntamentoRequest request) {
        log.info("Creazione nuovo appuntamento per clienteId={} da parte dello staff", request.clienteId());
        return appuntamentoService.prenota(request);
    }

    @PatchMapping("/{id}/stato")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Aggiorna stato appuntamento", description = "Cambia lo stato (es. da PRENOTATO a COMPLETATO) di un appuntamento.")
    public AppuntamentoResponse aggiornaStato(
            @PathVariable Long id, @RequestBody @Valid AggiornaStatoAppuntamentoRequest request) {
        log.info("Aggiornamento stato appuntamento id={} in {}", id, request.stato());
        return appuntamentoService.aggiornaStato(id, request.stato());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Elimina appuntamento", description = "Rimuove definitivamente un appuntamento dal sistema.")
    public void elimina(@PathVariable Long id) {
        log.warn("Eliminazione appuntamento id={}", id);
        appuntamentoService.elimina(id);
    }
}
