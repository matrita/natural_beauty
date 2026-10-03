package com.example.natural_beauty.service;

import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DisponibilitaService {

    @Value("${app.orario.apertura:09:00}")
    private String orarioAperturaStr;

    @Value("${app.orario.chiusura:18:00}")
    private String orarioChiusuraStr;

    private final AppuntamentoRepository appuntamentoRepository;
    private final OperatoreService operatoreService;
    private final TrattamentoService trattamentoService;
    private final AppuntamentoValidator appuntamentoValidator;

    public DisponibilitaService(
            AppuntamentoRepository appuntamentoRepository,
            OperatoreService operatoreService,
            TrattamentoService trattamentoService,
            AppuntamentoValidator appuntamentoValidator) {
        this.appuntamentoRepository = appuntamentoRepository;
        this.operatoreService = operatoreService;
        this.trattamentoService = trattamentoService;
        this.appuntamentoValidator = appuntamentoValidator;
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
        List<LocalDateTime> slots = new ArrayList<>();
        LocalTime apertura = LocalTime.parse(orarioAperturaStr);
        LocalTime chiusura = LocalTime.parse(orarioChiusuraStr);

        for (LocalDate d = start.toLocalDate(); !d.isAfter(end.toLocalDate()); d = d.plusDays(1)) {
            if (d.getDayOfWeek() == DayOfWeek.SUNDAY) continue;

            LocalDateTime cursor = LocalDateTime.of(d, apertura);
            LocalDateTime dayEnd = LocalDateTime.of(d, chiusura);

            while (!cursor.plusMinutes(durata).isAfter(dayEnd)) {
                if (!cursor.isBefore(start) && !cursor.isAfter(end) && appuntamentoValidator.isSlotLibero(esistenti, cursor, durata, null)) {
                    slots.add(cursor);
                }
                cursor = cursor.plusMinutes(step);
            }
        }
        return slots;
    }
}
