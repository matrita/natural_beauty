package com.example.natural_beauty.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.natural_beauty.dto.AppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.Cliente;
import com.example.natural_beauty.model.Operatore;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.model.Trattamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
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
    @Mock
    private AppuntamentoValidator appuntamentoValidator;

    @InjectMocks
    private AppuntamentoService appuntamentoService;

    private Cliente cliente;
    private Operatore operatore;
    private Trattamento trattamento;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(appuntamentoService, "orarioAperturaStr", "09:00");
        ReflectionTestUtils.setField(appuntamentoService, "orarioChiusuraStr", "18:00");

        cliente = new Cliente();
        cliente.setId(1L);
        cliente.setNome("Mario");
        cliente.setCognome("Rossi");
        cliente.setEmail("mario.rossi@example.com");

        operatore = new Operatore();
        operatore.setId(1L);
        operatore.setNome("Anna");
        operatore.setCognome("Verdi");
        operatore.setAttivo(true);

        trattamento = new Trattamento();
        trattamento.setId(1L);
        trattamento.setNome("Massaggio Viso");
        trattamento.setDurataMinuti(60);
        trattamento.setAttivo(true);
    }

    @Test
    @DisplayName("Dovrebbe prenotare con successo se tutti i vincoli sono rispettati")
    void testPrenotaConSuccesso() {
        LocalDate prossimoLunedi = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime inizio = LocalDateTime.of(prossimoLunedi, LocalTime.of(10, 0));

        when(clienteService.getEntity(1L)).thenReturn(cliente);
        when(operatoreService.getEntityWithLock(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        when(appuntamentoRepository.save(any(Appuntamento.class))).thenAnswer(invocation -> {
            Appuntamento a = invocation.getArgument(0);
            a.setId(99L);
            return a;
        });

        AppuntamentoRequest req = new AppuntamentoRequest(1L, 1L, 1L, inizio, "Note test");
        AppuntamentoResponse res = appuntamentoService.prenota(req);

        assertNotNull(res);
        assertEquals(99L, res.id());
        assertEquals(inizio, res.dataOraInizio());
        assertEquals(StatoAppuntamento.PRENOTATO, res.stato());
        verify(appuntamentoValidator).assertSlotLibero(1L, inizio, 60, null);
        verify(appuntamentoValidator).assertClienteLibero(1L, inizio, 60, null);
    }

    @Test
    @DisplayName("Dovrebbe lanciare eccezione se il validatore rileva uno slot occupato")
    void testPrenotaConConflitto() {
        LocalDate prossimoLunedi = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime inizio = LocalDateTime.of(prossimoLunedi, LocalTime.of(10, 0));

        when(clienteService.getEntity(1L)).thenReturn(cliente);
        when(operatoreService.getEntityWithLock(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Lo slot è occupato"))
                .when(appuntamentoValidator).assertSlotLibero(1L, inizio, 60, null);

        AppuntamentoRequest req = new AppuntamentoRequest(1L, 1L, 1L, inizio, "Note test");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            appuntamentoService.prenota(req)
        );

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    @DisplayName("Dovrebbe rifiutare prenotazioni nel passato")
    void testPrenotaNelPassato() {
        LocalDateTime passato = LocalDateTime.now().minusDays(1);
        when(clienteService.getEntity(1L)).thenReturn(cliente);
        when(operatoreService.getEntityWithLock(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);

        AppuntamentoRequest req = new AppuntamentoRequest(1L, 1L, 1L, passato, "Note");
        assertThrows(ResponseStatusException.class, () -> appuntamentoService.prenota(req));
    }

    @Test
    @DisplayName("Dovrebbe rifiutare prenotazioni di domenica")
    void testPrenotaDiDomenica() {
        LocalDate prossimaDomenica = LocalDate.now().plusWeeks(1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDateTime inizio = LocalDateTime.of(prossimaDomenica, LocalTime.of(10, 0));

        when(clienteService.getEntity(1L)).thenReturn(cliente);
        when(operatoreService.getEntityWithLock(1L)).thenReturn(operatore);
        when(trattamentoService.getEntity(1L)).thenReturn(trattamento);

        AppuntamentoRequest req = new AppuntamentoRequest(1L, 1L, 1L, inizio, "Note");
        assertThrows(ResponseStatusException.class, () -> appuntamentoService.prenota(req));
    }

    @Test
    @DisplayName("Non dovrebbe consentire il ripristino di un appuntamento cancellato")
    void testAggiornaStatoCancellato() {
        Appuntamento esistente = new Appuntamento();
        esistente.setId(10L);
        esistente.setStato(StatoAppuntamento.CANCELLATO);

        when(appuntamentoRepository.findById(10L)).thenReturn(Optional.of(esistente));

        assertThrows(ResponseStatusException.class, () ->
            appuntamentoService.aggiornaStato(10L, StatoAppuntamento.PRENOTATO)
        );
    }
}
