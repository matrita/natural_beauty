package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.CreaUtenteRequest;
import com.example.natural_beauty.dto.UtenteResponse;
import com.example.natural_beauty.model.Utente;
import com.example.natural_beauty.model.UtenteRuolo;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import com.example.natural_beauty.repository.ClienteRepository;
import com.example.natural_beauty.repository.UtenteRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class UtenteService {

    private final UtenteRepository utenteRepository;
    private final ClienteRepository clienteRepository;
    private final AppuntamentoRepository appuntamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public UtenteService(
            UtenteRepository utenteRepository, 
            ClienteRepository clienteRepository, 
            AppuntamentoRepository appuntamentoRepository, 
            PasswordEncoder passwordEncoder) {
        this.utenteRepository = utenteRepository;
        this.clienteRepository = clienteRepository;
        this.appuntamentoRepository = appuntamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UtenteResponse> trovaTutti() {
        return utenteRepository.findAll().stream()
                .sorted(Comparator.comparing(Utente::getId))
                .map(this::toResponse)
                .toList();
    }

    public UtenteResponse crea(CreaUtenteRequest request) {
        if (request.ruolo() == UtenteRuolo.CLIENTE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Gli utenti CLIENTE si creano tramite registrazione");
        }
        if (utenteRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }
        Utente u = new Utente();
        u.setEmail(request.email());
        u.setPasswordHash(passwordEncoder.encode(request.password()));
        u.setRuolo(request.ruolo());
        utenteRepository.save(u);
        return toResponse(u);
    }

    public UtenteResponse aggiornaRuolo(Long id, UtenteRuolo ruolo) {
        Utente u = utenteRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (ruolo == UtenteRuolo.CLIENTE && !clienteRepository.existsByEmail(u.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Per impostare ruolo CLIENTE serve un record Cliente con la stessa email");
        }
        u.setRuolo(ruolo);
        return toResponse(u);
    }

    public void elimina(Long id) {
        Utente u = utenteRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        
        clienteRepository.findByEmail(u.getEmail()).ifPresent(c -> {
            appuntamentoRepository.deleteByClienteId(c.getId());
            clienteRepository.delete(c);
        });

        utenteRepository.delete(u);
    }

    private UtenteResponse toResponse(Utente u) {
        return new UtenteResponse(u.getId(), u.getEmail(), u.getRuolo() != null ? u.getRuolo().name() : null);
    }
}
