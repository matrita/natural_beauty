package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.AppuntamentoRequest;
import com.example.natural_beauty.dto.AppuntamentoResponse;
import com.example.natural_beauty.dto.PrenotaMioAppuntamentoRequest;
import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AppuntamentoService {

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
                .orElseThrow(() -> notFound(id));
    }

    public AppuntamentoResponse prenota(AppuntamentoRequest request) {
        var cliente = clienteService.getEntity(request.clienteId());
        var operatore = operatoreService.getEntity(request.operatoreId());
        if (!operatore.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        }
        var trattamento = trattamentoService.getEntity(request.trattamentoId());
        if (!trattamento.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");
        }
        int durata = trattamento.getDurataMinuti();
        assertSlotLibero(operatore.getId(), request.dataOraInizio(), durata, null);
        Appuntamento a = new Appuntamento();
        a.setCliente(cliente);
        a.setOperatore(operatore);
        a.setTrattamento(trattamento);
        a.setDataOraInizio(request.dataOraInizio());
        a.setStato(StatoAppuntamento.PRENOTATO);
        a.setNote(request.note());
        Appuntamento salvato = appuntamentoRepository.save(a);
        return appuntamentoRepository
                .findByIdWithDetails(salvato.getId())
                .map(this::toResponse)
                .orElseThrow();
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

    public AppuntamentoResponse prenotaComeCliente(String emailCliente, PrenotaMioAppuntamentoRequest request) {
        var cliente = clienteService.getEntityByEmail(emailCliente);
        var operatore = operatoreService.getEntity(request.operatoreId());
        if (!operatore.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        }
        var trattamento = trattamentoService.getEntity(request.trattamentoId());
        if (!trattamento.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");
        }
        int durata = trattamento.getDurataMinuti();
        assertSlotLibero(operatore.getId(), request.dataOraInizio(), durata, null);
        Appuntamento a = new Appuntamento();
        a.setCliente(cliente);
        a.setOperatore(operatore);
        a.setTrattamento(trattamento);
        a.setDataOraInizio(request.dataOraInizio());
        a.setStato(StatoAppuntamento.PRENOTATO);
        a.setNote(request.note());
        Appuntamento salvato = appuntamentoRepository.save(a);
        return appuntamentoRepository
                .findByIdWithDetails(salvato.getId())
                .map(this::toResponse)
                .orElseThrow();
    }

    public AppuntamentoResponse cancellaMio(String emailCliente, Long appuntamentoId) {
        var cliente = clienteService.getEntityByEmail(emailCliente);
        Appuntamento a =
                appuntamentoRepository
                        .findByIdAndClienteIdWithDetails(appuntamentoId, cliente.getId())
                        .orElseThrow(() -> notFound(appuntamentoId));
        a.setStato(StatoAppuntamento.CANCELLATO);
        appuntamentoRepository.save(a);
        return appuntamentoRepository.findByIdWithDetails(appuntamentoId).map(this::toResponse).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> disponibilita(
            Long operatoreId, Long trattamentoId, LocalDateTime da, LocalDateTime a, int stepMinuti) {
        if (stepMinuti <= 0 || stepMinuti > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stepMinuti non valido");
        }
        var operatore = operatoreService.getEntity(operatoreId);
        if (!operatore.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        }
        var trattamento = trattamentoService.getEntity(trattamentoId);
        if (!trattamento.isAttivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");
        }
        int durata = trattamento.getDurataMinuti();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = da.isAfter(now) ? da : now;
        LocalDateTime end = a;
        if (!end.isAfter(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intervallo non valido");
        }

        // Carichiamo gli appuntamenti esistenti in una finestra leggermente piu ampia per gestire sovrapposizioni.
        LocalDateTime winStart = start.minusDays(1);
        LocalDateTime winEnd = end.plusDays(1);
        List<Appuntamento> esistenti =
                appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(operatoreId, winStart, winEnd);

        LocalTime apertura = LocalTime.of(9, 0);
        LocalTime chiusura = LocalTime.of(18, 0);

        LocalDate d0 = start.toLocalDate();
        LocalDate d1 = end.toLocalDate();
        List<LocalDateTime> slots = new java.util.ArrayList<>();
        for (LocalDate d = d0; !d.isAfter(d1); d = d.plusDays(1)) {
            if (d.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            LocalDateTime dayStart = LocalDateTime.of(d, apertura);
            LocalDateTime dayEnd = LocalDateTime.of(d, chiusura);
            LocalDateTime cursor = dayStart;
            while (!cursor.plusMinutes(durata).isAfter(dayEnd)) {
                if (cursor.isBefore(start) || cursor.isAfter(end)) {
                    cursor = cursor.plusMinutes(stepMinuti);
                    continue;
                }
                if (isSlotLiberoLocal(esistenti, cursor, durata)) {
                    slots.add(cursor);
                }
                cursor = cursor.plusMinutes(stepMinuti);
            }
        }
        return slots;
    }

    public AppuntamentoResponse aggiornaStato(Long id, StatoAppuntamento nuovoStato) {
        Appuntamento a = appuntamentoRepository.findById(id).orElseThrow(() -> notFound(id));
        a.setStato(nuovoStato);
        appuntamentoRepository.save(a);
        return appuntamentoRepository.findByIdWithDetails(id).map(this::toResponse).orElseThrow();
    }

    public void elimina(Long id) {
        if (!appuntamentoRepository.existsById(id)) {
            throw notFound(id);
        }
        appuntamentoRepository.deleteById(id);
    }

    private void assertSlotLibero(Long operatoreId, LocalDateTime inizio, int durataMinuti, Long escludiId) {
        LocalDateTime fineNuovo = inizio.plusMinutes(durataMinuti);
        LocalDateTime winStart = inizio.minusDays(7);
        LocalDateTime winEnd = fineNuovo.plusDays(7);
        List<Appuntamento> esistenti =
                appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(
                        operatoreId, winStart, winEnd);
        for (Appuntamento e : esistenti) {
            if (escludiId != null && escludiId.equals(e.getId())) {
                continue;
            }
            if (e.getStato() == StatoAppuntamento.CANCELLATO) {
                continue;
            }
            LocalDateTime inizioEsistente = e.getDataOraInizio();
            LocalDateTime fineEsistente =
                    inizioEsistente.plusMinutes(e.getTrattamento().getDurataMinuti());
            boolean sovrapposto = inizio.isBefore(fineEsistente) && inizioEsistente.isBefore(fineNuovo);
            if (sovrapposto) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Lo slot per questo operatore è già occupato");
            }
        }
    }

    private static boolean isSlotLiberoLocal(List<Appuntamento> esistenti, LocalDateTime inizio, int durataMinuti) {
        LocalDateTime fineNuovo = inizio.plusMinutes(durataMinuti);
        for (Appuntamento e : esistenti) {
            if (e.getStato() == StatoAppuntamento.CANCELLATO) {
                continue;
            }
            // La durata effettiva dipende dal trattamento dell'appuntamento esistente.
            int durataEsistente = Objects.requireNonNull(e.getTrattamento()).getDurataMinuti();
            LocalDateTime inizioEsistente = e.getDataOraInizio();
            LocalDateTime fineEsistente = inizioEsistente.plusMinutes(durataEsistente);
            boolean sovrapposto = inizio.isBefore(fineEsistente) && inizioEsistente.isBefore(fineNuovo);
            if (sovrapposto) {
                return false;
            }
        }
        return true;
    }

    private AppuntamentoResponse toResponse(Appuntamento a) {
        var c = a.getCliente();
        var o = a.getOperatore();
        var t = a.getTrattamento();
        return new AppuntamentoResponse(
                a.getId(),
                c.getId(),
                c.getNome() + " " + c.getCognome(),
                o.getId(),
                o.getNome() + " " + o.getCognome(),
                t.getId(),
                t.getNome(),
                t.getDurataMinuti(),
                a.getDataOraInizio(),
                a.getStato(),
                a.getNote());
    }

    private static ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Appuntamento non trovato: " + id);
    }
}
