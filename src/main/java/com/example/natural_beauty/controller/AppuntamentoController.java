package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.AggiornaStatoAppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.service.AppuntamentoService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appuntamenti")
public class AppuntamentoController {

    private final AppuntamentoService appuntamentoService;

    public AppuntamentoController(AppuntamentoService appuntamentoService) {
        this.appuntamentoService = appuntamentoService;
    }

    @GetMapping
    public List<AppuntamentoResponse> nelPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime da,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime a) {
        return appuntamentoService.trovaNelPeriodo(da, a);
    }

    @GetMapping("/disponibilita")
    public List<LocalDateTime> disponibilita(
            @RequestParam Long operatoreId,
            @RequestParam Long trattamentoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime da,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime a,
            @RequestParam(required = false, defaultValue = "15") int stepMinuti) {
        return appuntamentoService.disponibilita(operatoreId, trattamentoId, da, a, stepMinuti);
    }

    @GetMapping("/{id}")
    public AppuntamentoResponse dettaglio(@PathVariable Long id) {
        return appuntamentoService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppuntamentoResponse prenota(@RequestBody @Valid AppuntamentoRequest request) {
        return appuntamentoService.prenota(request);
    }

    @PatchMapping("/{id}/stato")
    public AppuntamentoResponse aggiornaStato(
            @PathVariable Long id, @RequestBody @Valid AggiornaStatoAppuntamentoRequest request) {
        return appuntamentoService.aggiornaStato(id, request.stato());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@PathVariable Long id) {
        appuntamentoService.elimina(id);
    }
}
