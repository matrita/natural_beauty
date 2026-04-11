package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.OperatoreRequest;
import com.example.natural_beauty.dto.OperatoreResponse;
import com.example.natural_beauty.service.OperatoreService;
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
@RequestMapping("/api/operatori")
@Tag(name = "Operatori", description = "Gestione dello staff tecnico del centro")
@SecurityRequirement(name = "bearerAuth")
public class OperatoreController {

    private static final Logger log = LoggerFactory.getLogger(OperatoreController.class);
    private final OperatoreService operatoreService;

    public OperatoreController(OperatoreService operatoreService) {
        this.operatoreService = operatoreService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Accessibile a tutti per prenotazioni
    @Operation(summary = "Elenco operatori", description = "Recupera la lista degli operatori. È possibile filtrare solo quelli attivi.")
    public List<OperatoreResponse> elenco(
            @RequestParam(required = false, defaultValue = "false") boolean soloAttivi,
            org.springframework.security.core.Authentication authentication) {
            
        boolean isCliente = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("CLIENTE") || a.getAuthority().equals("ROLE_CLIENTE"));
                
        if (isCliente || soloAttivi) {
            return operatoreService.trovaAttivi();
        }
        
        return operatoreService.trovaTutti();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Dettaglio operatore", description = "Recupera le informazioni di un singolo operatore tramite ID.")
    public OperatoreResponse dettaglio(@PathVariable Long id) {
        return operatoreService.trovaPerId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Nuovo operatore", description = "Crea un nuovo operatore (staff).")
    public OperatoreResponse crea(@RequestBody @Valid OperatoreRequest request) {
        log.info("Aggiunta nuovo operatore: {} {}", request.nome(), request.cognome());
        return operatoreService.crea(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Aggiorna operatore", description = "Modifica le informazioni o lo stato (attivo/disattivo) di un operatore.")
    public OperatoreResponse aggiorna(@PathVariable Long id, @RequestBody @Valid OperatoreRequest request) {
        log.info("Aggiornamento operatore id={}", id);
        return operatoreService.aggiorna(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Elimina operatore", description = "Rimuove definitivamente un operatore dal sistema.")
    public void elimina(@PathVariable Long id) {
        log.warn("Eliminazione definitiva operatore id={}", id);
        operatoreService.elimina(id);
    }
}
