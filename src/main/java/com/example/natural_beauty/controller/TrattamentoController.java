package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.TrattamentoRequest;
import com.example.natural_beauty.dto.TrattamentoResponse;
import com.example.natural_beauty.service.TrattamentoService;
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
@RequestMapping("/api/trattamenti")
@Tag(name = "Trattamenti", description = "Catalogo dei servizi offerti")
@SecurityRequirement(name = "bearerAuth")
public class TrattamentoController {

    private static final Logger log = LoggerFactory.getLogger(TrattamentoController.class);
    private final TrattamentoService trattamentoService;

    public TrattamentoController(TrattamentoService trattamentoService) {
        this.trattamentoService = trattamentoService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Catalogo trattamenti", description = "Recupera la lista dei trattamenti offerti, filtrabile per stato attivo.")
    public List<TrattamentoResponse> elenco(
            @RequestParam(required = false, defaultValue = "false") boolean soloAttivi,
            org.springframework.security.core.Authentication authentication) {
            
        boolean isCliente = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("CLIENTE") || a.getAuthority().equals("ROLE_CLIENTE"));
                
        if (isCliente || soloAttivi) {
            return trattamentoService.trovaAttivi();
        }
        
        return trattamentoService.trovaTutti();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Dettaglio trattamento", description = "Recupera le specifiche di un trattamento tramite ID.")
    public TrattamentoResponse dettaglio(@PathVariable Long id) {
        return trattamentoService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Nuovo trattamento", description = "Aggiunge un servizio al catalogo del centro.")
    public TrattamentoResponse crea(@RequestBody @Valid TrattamentoRequest request) {
        log.info("Creazione nuovo trattamento: {}", request.nome());
        return trattamentoService.crea(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Aggiorna trattamento", description = "Modifica le specifiche (nome, durata, prezzo, stato) di un trattamento.")
    public TrattamentoResponse aggiorna(@PathVariable Long id, @RequestBody @Valid TrattamentoRequest request) {
        log.info("Aggiornamento trattamento id={}: {}", id, request.nome());
        return trattamentoService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Elimina trattamento", description = "Rimuove definitivamente un trattamento dal catalogo.")
    public void elimina(@PathVariable Long id) {
        log.warn("Eliminazione trattamento id={}", id);
        trattamentoService.elimina(id);
    }
}
