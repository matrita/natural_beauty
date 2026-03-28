package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.TrattamentoRequest;
import com.example.natural_beauty.dto.TrattamentoResponse;
import com.example.natural_beauty.model.Trattamento;
import com.example.natural_beauty.repository.TrattamentoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class TrattamentoService {

    private final TrattamentoRepository trattamentoRepository;

    public TrattamentoService(TrattamentoRepository trattamentoRepository) {
        this.trattamentoRepository = trattamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<TrattamentoResponse> trovaTutti() {
        return trattamentoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TrattamentoResponse> trovaAttivi() {
        return trattamentoRepository.findByAttivoTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TrattamentoResponse trovaPerId(Long id) {
        return trattamentoRepository.findById(id).map(this::toResponse).orElseThrow(() -> notFound(id));
    }

    public TrattamentoResponse crea(TrattamentoRequest request) {
        Trattamento t = new Trattamento();
        applica(t, request);
        return toResponse(trattamentoRepository.save(t));
    }

    public TrattamentoResponse aggiorna(Long id, TrattamentoRequest request) {
        Trattamento t = trattamentoRepository.findById(id).orElseThrow(() -> notFound(id));
        applica(t, request);
        return toResponse(trattamentoRepository.save(t));
    }

    public void elimina(Long id) {
        if (!trattamentoRepository.existsById(id)) {
            throw notFound(id);
        }
        trattamentoRepository.deleteById(id);
    }

    Trattamento getEntity(Long id) {
        return trattamentoRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private void applica(Trattamento t, TrattamentoRequest r) {
        t.setNome(r.nome());
        t.setDurataMinuti(r.durataMinuti());
        t.setPrezzo(r.prezzo());
        t.setDescrizione(r.descrizione());
        if (r.attivo() != null) {
            t.setAttivo(r.attivo());
        }
    }

    private TrattamentoResponse toResponse(Trattamento t) {
        return new TrattamentoResponse(
                t.getId(),
                t.getNome(),
                t.getDurataMinuti(),
                t.getPrezzo(),
                t.getDescrizione(),
                t.isAttivo());
    }

    private static ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Trattamento non trovato: " + id);
    }
}
