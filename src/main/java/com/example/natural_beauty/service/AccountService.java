package com.example.natural_beauty.service;

import com.example.natural_beauty.model.Cliente;
import com.example.natural_beauty.repository.AppuntamentoRepository;
import com.example.natural_beauty.repository.ClienteRepository;
import com.example.natural_beauty.repository.UtenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Operazioni sull'account dell'utente autenticato.
 *
 * <p>Per un account {@code CLIENTE}, l'email dell'utente coincide con l'email del record {@link Cliente}.
 */
@Service
@Transactional
public class AccountService {

    private final UtenteRepository utenteRepository;
    private final ClienteRepository clienteRepository;
    private final AppuntamentoRepository appuntamentoRepository;

    public AccountService(
            UtenteRepository utenteRepository,
            ClienteRepository clienteRepository,
            AppuntamentoRepository appuntamentoRepository) {
        this.utenteRepository = utenteRepository;
        this.clienteRepository = clienteRepository;
        this.appuntamentoRepository = appuntamentoRepository;
    }

    /**
     * Cancella definitivamente l'utenza dell'utente con questa email.
     *
     * <p>Se esiste un record cliente con la stessa email, vengono eliminati prima gli appuntamenti e poi il cliente,
     * per evitare vincoli FK.
     */
    public void cancellaUtenza(String email) {
        clienteRepository
                .findByEmail(email)
                .ifPresent(
                        (Cliente c) -> {
                            appuntamentoRepository.deleteByClienteId(c.getId());
                            clienteRepository.delete(c);
                        });
        utenteRepository.findByEmail(email).ifPresent(utenteRepository::delete);
    }
}

