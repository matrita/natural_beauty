package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.AppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.dto.PrenotaMioAppuntamentoRequest;
import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.Cliente;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AppuntamentoService {

    private static final Logger log = LoggerFactory.getLogger(AppuntamentoService.class);
    private final AppuntamentoRepository appuntamentoRepository;
    private final ClienteService clienteService;
    private final OperatoreService operatoreService;
    private final TrattamentoService trattamentoService;

    public AppuntamentoService(
            AppuntamentoRepository appuntamentoRepository,
            ClienteService clienteService,
            OperatoreService operatoreService,
            TrattamentoService trattamentoService) {
        this.appuntamentoRepository = appuntamentoRepository;
        this.clienteService = clienteService;
        this.operatoreService = operatoreService;
        this.trattamentoService = trattamentoService;
    }

    @Transactional(readOnly = true)
    public List<AppuntamentoResponse> trovaNelPeriodo(LocalDateTime inizio, LocalDateTime fine) {
        return appuntamentoRepository
                .findByDataOraInizioBetweenOrderByDataOraInizioAsc(inizio, fine)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppuntamentoResponse trovaPerId(Long id) {
        return appuntamentoRepository
                .findByIdWithDetails(id)
                .map(this::toResponse)
                .orElseThrow(() -> {
                    log.error("Tentativo di recupero appuntamento inesistente: id={}", id);
                    return notFound(id);
                });
    }

    public AppuntamentoResponse prenota(AppuntamentoRequest request) {
        var cliente = clienteService.getEntity(request.clienteId());
        return salvaNuovoAppuntamento(cliente, request.operatoreId(), request.trattamentoId(), request.dataOraInizio(), request.note());
    }

    public AppuntamentoResponse prenotaComeCliente(String emailCliente, PrenotaMioAppuntamentoRequest request) {
        var cliente = clienteService.getEntityByEmail(emailCliente);
        return salvaNuovoAppuntamento(cliente, request.operatoreId(), request.trattamentoId(), request.dataOraInizio(), request.note());
    }

    private AppuntamentoResponse salvaNuovoAppuntamento(Cliente cliente, Long operatoreId, Long trattamentoId, LocalDateTime inizio, String note) {
        var operatore = operatoreService.getEntity(operatoreId);
        if (!operatore.isAttivo()) {
            log.warn("Tentativo di prenotazione con operatore non attivo: {}", operatoreId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        }
        var trattamento = trattamentoService.getEntity(trattamentoId);
        if (!trattamento.isAttivo()) {
            log.warn("Tentativo di prenotazione con trattamento non attivo: {}", trattamentoId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");
        }

        assertSlotLibero(operatore.getId(), inizio, trattamento.getDurataMinuti(), null);

        Appuntamento a = new Appuntamento();
        a.setCliente(cliente);
        a.setOperatore(operatore);
        a.setTrattamento(trattamento);
        a.setDataOraInizio(inizio);
        a.setStato(StatoAppuntamento.PRENOTATO);
        a.setNote(note);
        
        Appuntamento salvato = appuntamentoRepository.save(a);
        log.info("Salvato nuovo appuntamento id={} per cliente={} con operatore={} alle {}", 
                salvato.getId(), cliente.getEmail(), operatore.getCognome(), inizio);
        return toResponse(salvato);
    }

    @Transactional(readOnly = true)
    public List<AppuntamentoResponse> trovaMieiNelPeriodo(String emailCliente, LocalDateTime inizio, LocalDateTime fine) {
        var cliente = clienteService.getEntityByEmail(emailCliente);
        return appuntamentoRepository
                .findByClienteIdNelPeriodoWithDetails(cliente.getId(), inizio, fine)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AppuntamentoResponse cancellaMio(String emailCliente, Long appuntamentoId) {
        var cliente = clienteService.getEntityByEmail(emailCliente);
        Appuntamento a = appuntamentoRepository
                        .findByIdAndClienteIdWithDetails(appuntamentoId, cliente.getId())
                        .orElseThrow(() -> {
                            log.error("Cancellazione fallita: appuntamento id={} non appartiene al cliente {}", appuntamentoId, emailCliente);
                            return notFound(appuntamentoId);
                        });
        a.setStato(StatoAppuntamento.CANCELLATO);
        log.info("Cliente {} ha cancellato l'appuntamento {}", emailCliente, appuntamentoId);
        return toResponse(appuntamentoRepository.save(a));
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> disponibilita(
            Long operatoreId, Long trattamentoId, LocalDateTime da, LocalDateTime a, int stepMinuti) {
        validazioneParametriDisponibilita(da, a, stepMinuti);
        
        var operatore = operatoreService.getEntity(operatoreId);
        if (!operatore.isAttivo()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        var trattamento = trattamentoService.getEntity(trattamentoId);
        if (!trattamento.isAttivo()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");

        LocalDateTime start = da.isAfter(LocalDateTime.now()) ? da : LocalDateTime.now();
        List<Appuntamento> esistenti = appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(
                operatoreId, start.minusDays(1), a.plusDays(1));

        return calcolaSlotDisponibili(start, a, trattamento.getDurataMinuti(), stepMinuti, esistenti);
    }

    private void validazioneParametriDisponibilita(LocalDateTime da, LocalDateTime a, int stepMinuti) {
        if (stepMinuti <= 0 || stepMinuti > 120) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stepMinuti non valido");
        if (!a.isAfter(da)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intervallo non valido");
    }

    private List<LocalDateTime> calcolaSlotDisponibili(LocalDateTime start, LocalDateTime end, int durata, int step, List<Appuntamento> esistenti) {
        List<LocalDateTime> slots = new java.util.ArrayList<>();
        LocalTime apertura = LocalTime.of(9, 0);
        LocalTime chiusura = LocalTime.of(18, 0);

        for (LocalDate d = start.toLocalDate(); !d.isAfter(end.toLocalDate()); d = d.plusDays(1)) {
            if (d.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

            LocalDateTime cursor = LocalDateTime.of(d, apertura);
            LocalDateTime dayEnd = LocalDateTime.of(d, chiusura);

            while (!cursor.plusMinutes(durata).isAfter(dayEnd)) {
                if (!cursor.isBefore(start) && !cursor.isAfter(end) && isSlotLibero(esistenti, cursor, durata, null)) {
                    slots.add(cursor);
                }
                cursor = cursor.plusMinutes(step);
            }
        }
        return slots;
    }

    public AppuntamentoResponse aggiornaStato(Long id, StatoAppuntamento nuovoStato) {
        Appuntamento a = appuntamentoRepository.findById(id).orElseThrow(() -> notFound(id));
        log.info("Cambio stato appuntamento id={} da {} a {}", id, a.getStato(), nuovoStato);
        a.setStato(nuovoStato);
        return toResponse(appuntamentoRepository.save(a));
    }

    public void elimina(Long id) {
        if (!appuntamentoRepository.existsById(id)) throw notFound(id);
        log.warn("Eliminazione definitiva appuntamento id={}", id);
        appuntamentoRepository.deleteById(id);
    }

    private void assertSlotLibero(Long operatoreId, LocalDateTime inizio, int durataMinuti, Long escludiId) {
        List<Appuntamento> esistenti = appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(
                        operatoreId, inizio.minusHours(4), inizio.plusHours(4));
        
        if (!isSlotLibero(esistenti, inizio, durataMinuti, escludiId)) {
            log.warn("Conflitto di sovrapposizione: operatore={} alle {}", operatoreId, inizio);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lo slot per questo operatore è già occupato");
        }
    }

    private boolean isSlotLibero(List<Appuntamento> esistenti, LocalDateTime inizio, int durataNuovo, Long escludiId) {
        LocalDateTime fineNuovo = inizio.plusMinutes(durataNuovo);
        for (Appuntamento e : esistenti) {
            if (e.getStato() == StatoAppuntamento.CANCELLATO || (escludiId != null && escludiId.equals(e.getId()))) continue;
            LocalDateTime fineEsistente = e.getDataOraInizio().plusMinutes(e.getTrattamento().getDurataMinuti());
            if (inizio.isBefore(fineEsistente) && e.getDataOraInizio().isBefore(fineNuovo)) return false;
        }
        return true;
    }

    private AppuntamentoResponse toResponse(Appuntamento a) {
        return new AppuntamentoResponse(
                a.getId(), a.getCliente().getId(), a.getCliente().getNome() + " " + a.getCliente().getCognome(),
                a.getOperatore().getId(), a.getOperatore().getNome() + " " + a.getOperatore().getCognome(),
                a.getTrattamento().getId(), a.getTrattamento().getNome(), a.getTrattamento().getDurataMinuti(),
                a.getDataOraInizio(), a.getStato(), a.getNote());
    }

    private static ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Appuntamento non trovato: " + id);
    }
}
