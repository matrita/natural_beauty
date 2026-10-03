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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AppuntamentoService {

    @Value("${app.orario.apertura:09:00}")
    private String orarioAperturaStr;

    @Value("${app.orario.chiusura:18:00}")
    private String orarioChiusuraStr;

    private static final Logger log = LoggerFactory.getLogger(AppuntamentoService.class);
    private final AppuntamentoRepository appuntamentoRepository;
    private final ClienteService clienteService;
    private final OperatoreService operatoreService;
    private final TrattamentoService trattamentoService;
    private final AppuntamentoValidator appuntamentoValidator;

    public AppuntamentoService(
            AppuntamentoRepository appuntamentoRepository,
            ClienteService clienteService,
            OperatoreService operatoreService,
            TrattamentoService trattamentoService,
            AppuntamentoValidator appuntamentoValidator) {
        this.appuntamentoRepository = appuntamentoRepository;
        this.clienteService = clienteService;
        this.operatoreService = operatoreService;
        this.trattamentoService = trattamentoService;
        this.appuntamentoValidator = appuntamentoValidator;
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
        var operatore = operatoreService.getEntityWithLock(operatoreId);
        if (!operatore.isAttivo()) {
            log.warn("Tentativo di prenotazione con operatore non attivo: {}", operatoreId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operatore non attivo");
        }
        var trattamento = trattamentoService.getEntity(trattamentoId);
        if (!trattamento.isAttivo()) {
            log.warn("Tentativo di prenotazione con trattamento non attivo: {}", trattamentoId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trattamento non attivo");
        }

        if (inizio.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non è possibile prenotare un appuntamento nel passato");
        }
        
        if (inizio.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il centro è chiuso di domenica");
        }
        
        LocalDateTime aperturaGiorno = LocalDateTime.of(inizio.toLocalDate(), LocalTime.parse(orarioAperturaStr));
        LocalDateTime chiusuraGiorno = LocalDateTime.of(inizio.toLocalDate(), LocalTime.parse(orarioChiusuraStr));
        LocalDateTime fine = inizio.plusMinutes(trattamento.getDurataMinuti());
        
        if (inizio.isBefore(aperturaGiorno) || fine.isAfter(chiusuraGiorno)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("L'appuntamento deve essere compreso nell'orario lavorativo (%s - %s)", orarioAperturaStr, orarioChiusuraStr));
        }

        appuntamentoValidator.assertSlotLibero(operatore.getId(), inizio, trattamento.getDurataMinuti(), null);
        appuntamentoValidator.assertClienteLibero(cliente.getId(), inizio, trattamento.getDurataMinuti(), null);

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
                        
        if (a.getDataOraInizio().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non è possibile cancellare un appuntamento a meno di 24 ore dall'inizio");
        }
        
        a.setStato(StatoAppuntamento.CANCELLATO);
        log.info("Cliente {} ha cancellato l'appuntamento {}", emailCliente, appuntamentoId);
        return toResponse(appuntamentoRepository.save(a));
    }

    // La logica di disponibilità è stata spostata in DisponibilitaService

    public AppuntamentoResponse aggiornaStato(Long id, StatoAppuntamento nuovoStato) {
        Appuntamento a = appuntamentoRepository.findById(id).orElseThrow(() -> notFound(id));
        
        if (a.getStato() == StatoAppuntamento.CANCELLATO && nuovoStato != StatoAppuntamento.CANCELLATO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non è possibile ripristinare un appuntamento cancellato");
        }
        
        if (a.getStato() == StatoAppuntamento.COMPLETATO && nuovoStato != StatoAppuntamento.COMPLETATO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non è possibile modificare lo stato di un appuntamento già completato");
        }
        
        log.info("Cambio stato appuntamento id={} da {} a {}", id, a.getStato(), nuovoStato);
        a.setStato(nuovoStato);
        return toResponse(appuntamentoRepository.save(a));
    }

    public void elimina(Long id) {
        if (!appuntamentoRepository.existsById(id)) throw notFound(id);
        log.warn("Eliminazione definitiva appuntamento id={}", id);
        appuntamentoRepository.deleteById(id);
    }

    // I metodi assertSlotLibero, assertClienteLibero e isSlotLibero sono stati spostati in AppuntamentoValidator

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
