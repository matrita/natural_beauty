package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.OperatoreRequest;
import com.example.natural_beauty.dto.OperatoreResponse;
import com.example.natural_beauty.service.OperatoreService;
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
@RequestMapping("/api/operatori")
public class OperatoreController {

    private final OperatoreService operatoreService;

    public OperatoreController(OperatoreService operatoreService) {
        this.operatoreService = operatoreService;
    }

    @GetMapping
    public List<OperatoreResponse> elenco(@RequestParam(required = false, defaultValue = "false") boolean soloAttivi) {
        return soloAttivi ? operatoreService.trovaAttivi() : operatoreService.trovaTutti();
    }

    @GetMapping("/{id}")
    public OperatoreResponse dettaglio(@PathVariable Long id) {
        return operatoreService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OperatoreResponse crea(@RequestBody @Valid OperatoreRequest request) {
        return operatoreService.crea(request);
    }

    @PutMapping("/{id}")
    public OperatoreResponse aggiorna(@PathVariable Long id, @RequestBody @Valid OperatoreRequest request) {
        return operatoreService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@PathVariable Long id) {
        operatoreService.elimina(id);
    }
}
