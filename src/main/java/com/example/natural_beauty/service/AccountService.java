package com.example.natural_beauty.service;

import com.example.natural_beauty.model.Utente;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import com.example.natural_beauty.repository.ClienteRepository;
import com.example.natural_beauty.repository.UtenteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AccountService {

    private final UtenteRepository utenteRepository;
    private final ClienteRepository clienteRepository;
    private final AppuntamentoRepository appuntamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            UtenteRepository utenteRepository,
            ClienteRepository clienteRepository,
            AppuntamentoRepository appuntamentoRepository,
            PasswordEncoder passwordEncoder) {
        this.utenteRepository = utenteRepository;
        this.clienteRepository = clienteRepository;
        this.appuntamentoRepository = appuntamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void cambiaMiaPassword(String email, String vecchiaPassword, String nuovaPassword) {
        Utente u = utenteRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        
        // Verifica della vecchia password
        if (!passwordEncoder.matches(vecchiaPassword, u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La password attuale non è corretta");
        }
        
        u.setPasswordHash(passwordEncoder.encode(nuovaPassword));
        utenteRepository.save(u);
    }

    public void cancellaUtenza(String email) {
        clienteRepository.findByEmail(email).ifPresent(c -> {
            appuntamentoRepository.deleteByClienteId(c.getId());
            clienteRepository.delete(c);
        });
        utenteRepository.findByEmail(email).ifPresent(utenteRepository::delete);
    }

    // Metodo per l'amministratore (non richiede la vecchia password)
    public void resetPassword(String email, String nuovaPassword) {
        Utente u = utenteRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        u.setPasswordHash(passwordEncoder.encode(nuovaPassword));
        utenteRepository.save(u);
    }
}
