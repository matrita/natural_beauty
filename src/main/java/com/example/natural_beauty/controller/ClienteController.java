package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.ClienteRequest;
import com.example.natural_beauty.dto.ClienteResponse;
import com.example.natural_beauty.service.ClienteService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clienti")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponse> elenco() {
        return clienteService.trovaTutti();
    }

    @GetMapping("/{id}")
    public ClienteResponse dettaglio(@PathVariable Long id) {
        return clienteService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse crea(@RequestBody @Valid ClienteRequest request) {
        return clienteService.crea(request);
    }

    @PutMapping("/{id}")
    public ClienteResponse aggiorna(@PathVariable Long id, @RequestBody @Valid ClienteRequest request) {
        return clienteService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void elimina(@PathVariable Long id) {
        clienteService.elimina(id);
    }
}
