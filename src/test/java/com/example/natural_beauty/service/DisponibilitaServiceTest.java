package com.example.natural_beauty.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.Operatore;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.model.Trattamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DisponibilitaServiceTest {

    @Mock
    private AppuntamentoRepository appuntamentoRepository;
    @Mock
    private OperatoreService operatoreService;
    @Mock
    private TrattamentoService trattamentoService;

    private DisponibilitaService disponibilitaService;
    private AppuntamentoValidator appuntamentoValidator;

    private Operatore operatore;
    private Trattamento trattamento;

    @BeforeEach
    void setUp() {
        appuntamentoValidator = new AppuntamentoValidator(appuntamentoRepository);
        disponibilitaService = new DisponibilitaService(
                appuntamentoRepository, operatoreService, trattamentoService, appuntamentoValidator);

        ReflectionTestUtils.setField(disponibilitaService, "orarioAperturaStr", "09:00");
        ReflectionTestUtils.setField(disponibilitaService, "orarioChiusuraStr", "18:00");

        operatore = new Operatore();
        operatore.setId(1L);
        operatore.setNome("Anna");
        operatore.setCognome("Verdi");
        operatore.setAttivo(true);

        trattamento = new Trattamento();
        trattamento.setId(1L);
        trattamento.setNome("Massaggio");
        trattamento.setDurataMinuti(60);
        trattamento.setAttivo(true);
    }

    @Test
    @DisplayName("Dovrebbe restituire tutti gli slot disponibili quando non ci sono appuntamenti")
    void testDisponibilitaSenzaAppuntamenti() {
        LocalDate prossimoLunedi = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime da = LocalDateTime.of(prossimoLunedi, LocalTime.of(9, 0));
        LocalDateTime a = LocalDateTime.of(prossimoLunedi, LocalTime.of(18, 0));

        when(operatoreService.getEntity(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        List<LocalDateTime> result = disponibilitaService.disponibilita(1L, 1L, da, a, 60);

        // Dalle 9 alle 18: trattamenti da 60 min, slot alle 9, 10, 11, 12, 13, 14, 15, 16, 17 (9 slot)
        assertFalse(result.isEmpty());
        assertEquals(9, result.size());
        assertEquals(da, result.get(0));
    }

    @Test
    @DisplayName("Dovrebbe escludere gli slot già occupati da altri appuntamenti")
    void testDisponibilitaConAppuntamentiEsistenti() {
        LocalDate prossimoLunedi = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime da = LocalDateTime.of(prossimoLunedi, LocalTime.of(9, 0));
        LocalDateTime a = LocalDateTime.of(prossimoLunedi, LocalTime.of(12, 0));

        // Appuntamento esistente dalle 10:00 alle 11:00
        Appuntamento esistente = new Appuntamento();
        esistente.setDataOraInizio(LocalDateTime.of(prossimoLunedi, LocalTime.of(10, 0)));
        esistente.setTrattamento(trattamento);
        esistente.setStato(StatoAppuntamento.PRENOTATO);

        when(operatoreService.getEntity(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(any(), any(), any()))
                .thenReturn(List.of(esistente));

        List<LocalDateTime> result = disponibilitaService.disponibilita(1L, 1L, da, a, 30);

        // Slot dalle 9:00 alle 12:00 con durata 60 min e step 30 min:
        // 09:00 -> fine 10:00 (Libero)
        // 09:30 -> fine 10:30 (Occupato, si sovrappone a 10:00-11:00)
        // 10:00 -> fine 11:00 (Occupato)
        // 10:30 -> fine 11:30 (Occupato)
        // 11:00 -> fine 12:00 (Libero)
        // 11:30 -> fine 12:30 (Escluso perché termina dopo le 12:00)

        assertTrue(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(9, 0))));
        assertFalse(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(9, 30))));
        assertFalse(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(10, 0))));
        assertFalse(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(10, 30))));
        assertTrue(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(11, 0))));
        assertFalse(result.contains(LocalDateTime.of(prossimoLunedi, LocalTime.of(11, 30))));
    }

    @Test
    @DisplayName("Dovrebbe lanciare eccezione se l'operatore non è attivo")
    void testOperatoreNonAttivo() {
        operatore.setAttivo(false);
        when(operatoreService.getEntity(1L)).thenReturn(operatore);

        LocalDate prossimoLunedi = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime da = LocalDateTime.of(prossimoLunedi, LocalTime.of(9, 0));
        LocalDateTime a = LocalDateTime.of(prossimoLunedi, LocalTime.of(18, 0));

        assertThrows(ResponseStatusException.class, () ->
            disponibilitaService.disponibilita(1L, 1L, da, a, 30)
        );
    }
}
