package com.example.natural_beauty.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.Operatore;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.model.Trattamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AppuntamentoServiceTest {

    @Mock
    private AppuntamentoRepository appuntamentoRepository;
    @Mock
    private ClienteService clienteService;
    @Mock
    private OperatoreService operatoreService;
    @Mock
    private TrattamentoService trattamentoService;

    @InjectMocks
    private AppuntamentoService appuntamentoService;

    private Operatore operatore;
    private Trattamento trattamento;

    @BeforeEach
    void setUp() {
        operatore = new Operatore();
        operatore.setId(1L);
        operatore.setAttivo(true);

        trattamento = new Trattamento();
        trattamento.setId(1L);
        trattamento.setDurataMinuti(60);
        trattamento.setAttivo(true);
    }

    @Test
    @DisplayName("Dovrebbe restituire slot disponibili quando non ci sono appuntamenti")
    void testDisponibilitaSenzaAppuntamenti() {
        LocalDateTime da = LocalDateTime.of(2025, 5, 12, 9, 0); // Un lunedì
        LocalDateTime a = LocalDateTime.of(2025, 5, 12, 18, 0);

        when(operatoreService.getEntity(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        List<LocalDateTime> result = appuntamentoService.disponibilita(1L, 1L, da, a, 60);

        // Dalle 9 alle 18 sono 9 ore. Con un trattamento di 60 min e step di 60 min, dovremmo avere 9 slot.
        assertFalse(result.isEmpty());
        assertEquals(9, result.size());
        assertEquals(da, result.get(0));
    }

    @Test
    @DisplayName("Dovrebbe escludere gli slot già occupati da altri appuntamenti")
    void testDisponibilitaConAppuntamentiEsistenti() {
        LocalDateTime da = LocalDateTime.of(2025, 5, 12, 9, 0);
        LocalDateTime a = LocalDateTime.of(2025, 5, 12, 12, 0);

        // Appuntamento esistente dalle 10:00 alle 11:00
        Appuntamento esistente = new Appuntamento();
        esistente.setDataOraInizio(LocalDateTime.of(2025, 5, 12, 10, 0));
        esistente.setTrattamento(trattamento);
        esistente.setStato(StatoAppuntamento.PRENOTATO);

        when(operatoreService.getEntity(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(any(), any(), any()))
                .thenReturn(List.of(esistente));

        List<LocalDateTime> result = appuntamentoService.disponibilita(1L, 1L, da, a, 30);

        // In 3 ore (9-12) con step 30 min ci sarebbero 6 slot (9, 9:30, 10, 10:30, 11, 11:30)
        // L'appuntamento dalle 10 alle 11 occupa gli slot che inizierebbero alle 10:00 e 10:30.
        // Anche 9:30 è occupato perché finirebbe alle 10:30 (sovrapponendosi con l'inizio alle 10).
        // Vediamo quali restano liberi: 
        // 9:00 -> finisce 10:00 (OK, non sovrapposto a 10:00)
        // 9:30 -> finisce 10:30 (Occupato, sovrapposto a 10:00-11:00)
        // 10:00 -> (Occupato)
        // 10:30 -> (Occupato)
        // 11:00 -> finisce 12:00 (OK)
        
        assertTrue(result.contains(LocalDateTime.of(2025, 5, 12, 9, 0)));
        assertFalse(result.contains(LocalDateTime.of(2025, 5, 12, 9, 30)));
        assertFalse(result.contains(LocalDateTime.of(2025, 5, 12, 10, 0)));
        assertTrue(result.contains(LocalDateTime.of(2025, 5, 12, 11, 0)));
    }

    @Test
    @DisplayName("Dovrebbe lanciare eccezione se lo slot è già occupato durante la prenotazione")
    void testPrenotaConConflitto() {
        LocalDateTime inizio = LocalDateTime.of(2025, 5, 12, 10, 0);
        
        Appuntamento esistente = new Appuntamento();
        esistente.setDataOraInizio(inizio);
        esistente.setTrattamento(trattamento);
        esistente.setStato(StatoAppuntamento.PRENOTATO);

        when(operatoreService.getEntity(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(any(), any(), any()))
                .thenReturn(List.of(esistente));

        assertThrows(ResponseStatusException.class, () -> 
            appuntamentoService.prenota(new com.example.natural_beauty.dto.AppuntamentoRequest(1L, 1L, 1L, inizio, "note"))
        );
    }
}
