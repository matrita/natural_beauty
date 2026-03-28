package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.OperatoreRequest;
import com.example.natural_beauty.dto.OperatoreResponse;
import com.example.natural_beauty.model.Operatore;
import com.example.natural_beauty.repository.OperatoreRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class OperatoreService {

    private final OperatoreRepository operatoreRepository;

    public OperatoreService(OperatoreRepository operatoreRepository) {
        this.operatoreRepository = operatoreRepository;
    }

    @Transactional(readOnly = true)
    public List<OperatoreResponse> trovaTutti() {
        return operatoreRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OperatoreResponse> trovaAttivi() {
        return operatoreRepository.findByAttivoTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OperatoreResponse trovaPerId(Long id) {
        return operatoreRepository.findById(id).map(this::toResponse).orElseThrow(() -> notFound(id));
    }

    public OperatoreResponse crea(OperatoreRequest request) {
        Operatore o = new Operatore();
        applica(o, request);
        return toResponse(operatoreRepository.save(o));
    }

    public OperatoreResponse aggiorna(Long id, OperatoreRequest request) {
        Operatore o = operatoreRepository.findById(id).orElseThrow(() -> notFound(id));
        applica(o, request);
        return toResponse(operatoreRepository.save(o));
    }

    public void elimina(Long id) {
        if (!operatoreRepository.existsById(id)) {
            throw notFound(id);
        }
        operatoreRepository.deleteById(id);
    }

    Operatore getEntity(Long id) {
        return operatoreRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private void applica(Operatore o, OperatoreRequest r) {
        o.setNome(r.nome());
        o.setCognome(r.cognome());
        o.setSpecializzazioni(r.specializzazioni());
        if (r.attivo() != null) {
            o.setAttivo(r.attivo());
        }
    }

    private OperatoreResponse toResponse(Operatore o) {
        return new OperatoreResponse(
                o.getId(), o.getNome(), o.getCognome(), o.getSpecializzazioni(), o.isAttivo());
    }

    private static ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Operatore non trovato: " + id);
    }
}
