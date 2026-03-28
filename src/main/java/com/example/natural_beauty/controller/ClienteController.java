package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.ClienteRequest;
import com.example.natural_beauty.dto.ClienteResponse;
import com.example.natural_beauty.service.ClienteService;
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
@RequestMapping("/api/clienti")
@Tag(name = "Clienti", description = "Gestione anagrafica clienti")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class ClienteController {

    private static final Logger log = LoggerFactory.getLogger(ClienteController.class);
    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @Operation(summary = "Elenco clienti", description = "Recupera la lista completa di tutti i clienti registrati.")
    public List<ClienteResponse> elenco() {
        return clienteService.trovaTutti();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dettaglio cliente", description = "Recupera le informazioni di un singolo cliente tramite ID.")
    public ClienteResponse dettaglio(@PathVariable Long id) {
        return clienteService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Nuovo cliente", description = "Crea un nuovo profilo cliente nel sistema.")
    public ClienteResponse crea(@RequestBody @Valid ClienteRequest request) {
        log.info("Creazione nuovo cliente: {} {}", request.nome(), request.cognome());
        return clienteService.crea(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Aggiorna cliente", description = "Modifica le informazioni di un cliente esistente.")
    public ClienteResponse aggiorna(@PathVariable Long id, @RequestBody @Valid ClienteRequest request) {
        log.info("Aggiornamento cliente id={}", id);
        return clienteService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina cliente", description = "Rimuove definitivamente un cliente dal sistema.")
    public void elimina(@PathVariable Long id) {
        log.warn("Eliminazione cliente id={}", id);
        clienteService.elimina(id);
    }
}
