package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.TrattamentoRequest;
import com.example.natural_beauty.dto.TrattamentoResponse;
import com.example.natural_beauty.service.TrattamentoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trattamenti")
public class TrattamentoController {

    private final TrattamentoService trattamentoService;

    public TrattamentoController(TrattamentoService trattamentoService) {
        this.trattamentoService = trattamentoService;
    }

    @GetMapping
    public List<TrattamentoResponse> elenco(
            @RequestParam(required = false, defaultValue = "false") boolean soloAttivi) {
        return soloAttivi ? trattamentoService.trovaAttivi() : trattamentoService.trovaTutti();
    }

    @GetMapping("/{id}")
    public TrattamentoResponse dettaglio(@PathVariable Long id) {
        return trattamentoService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrattamentoResponse crea(@RequestBody @Valid TrattamentoRequest request) {
        return trattamentoService.crea(request);
    }

    @PutMapping("/{id}")
    public TrattamentoResponse aggiorna(@PathVariable Long id, @RequestBody @Valid TrattamentoRequest request) {
        return trattamentoService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@PathVariable Long id) {
        trattamentoService.elimina(id);
    }
}
