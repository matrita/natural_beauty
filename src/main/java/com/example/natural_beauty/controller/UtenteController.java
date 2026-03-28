package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.AggiornaPasswordUtenteRequest;
import com.example.natural_beauty.dto.AggiornaRuoloUtenteRequest;
import com.example.natural_beauty.dto.CreaUtenteRequest;
import com.example.natural_beauty.dto.UtenteResponse;
import com.example.natural_beauty.service.UtenteService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gestione profili utente (solo {@code ADMIN}).
 *
 * <p>Permette di creare utenti staff/admin, cambiare ruolo, reimpostare password e cancellare utenti.
 */
@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    private final UtenteService utenteService;

    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }

    /** Elenco utenti. */
    @GetMapping
    public List<UtenteResponse> elenco() {
        return utenteService.trovaTutti();
    }

    /** Crea un utente di backoffice (non CLIENTE). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UtenteResponse crea(@RequestBody @Valid CreaUtenteRequest request) {
        return utenteService.crea(request);
    }

    /** Cambia ruolo ad un utente. */
    @PatchMapping("/{id}/ruolo")
    public UtenteResponse aggiornaRuolo(
            @PathVariable Long id, @RequestBody @Valid AggiornaRuoloUtenteRequest request) {
        return utenteService.aggiornaRuolo(id, request.ruolo());
    }

    /** Reimposta password di un utente. */
    @PostMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void aggiornaPassword(
            @PathVariable Long id, @RequestBody @Valid AggiornaPasswordUtenteRequest request) {
        utenteService.aggiornaPassword(id, request.password());
    }

    /** Elimina un utente. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@PathVariable Long id) {
        utenteService.elimina(id);
    }
}
