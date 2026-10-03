package com.example.natural_beauty.service;

import com.example.natural_beauty.model.Appuntamento;
import com.example.natural_beauty.model.StatoAppuntamento;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AppuntamentoValidator {

    private static final Logger log = LoggerFactory.getLogger(AppuntamentoValidator.class);
    private final AppuntamentoRepository appuntamentoRepository;

    public AppuntamentoValidator(AppuntamentoRepository appuntamentoRepository) {
        this.appuntamentoRepository = appuntamentoRepository;
    }

    public void assertSlotLibero(Long operatoreId, LocalDateTime inizio, int durataMinuti, Long escludiId) {
        List<Appuntamento> esistenti = appuntamentoRepository.findByOperatoreIdAndDataOraInizioBetween(
                operatoreId, inizio.minusHours(4), inizio.plusHours(4));

        if (!isSlotLibero(esistenti, inizio, durataMinuti, escludiId)) {
            log.warn("Conflitto di sovrapposizione: operatore={} alle {}", operatoreId, inizio);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lo slot per questo operatore è già occupato");
        }
    }

    public void assertClienteLibero(Long clienteId, LocalDateTime inizio, int durataMinuti, Long escludiId) {
        List<Appuntamento> esistenti = appuntamentoRepository.findByClienteIdNelPeriodoWithDetails(
                clienteId, inizio.minusHours(4), inizio.plusHours(4));

        if (!isSlotLibero(esistenti, inizio, durataMinuti, escludiId)) {
            log.warn("Conflitto di sovrapposizione: cliente={} alle {}", clienteId, inizio);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hai già un appuntamento prenotato in questo orario");
        }
    }

    public boolean isSlotLibero(List<Appuntamento> esistenti, LocalDateTime inizio, int durataNuovo, Long escludiId) {
        LocalDateTime fineNuovo = inizio.plusMinutes(durataNuovo);
        for (Appuntamento e : esistenti) {
            if (e.getStato() == StatoAppuntamento.CANCELLATO || (escludiId != null && escludiId.equals(e.getId()))) continue;
            LocalDateTime fineEsistente = e.getDataOraInizio().plusMinutes(e.getTrattamento().getDurataMinuti());
            if (inizio.isBefore(fineEsistente) && e.getDataOraInizio().isBefore(fineNuovo)) return false;
        }
        return true;
    }
}
