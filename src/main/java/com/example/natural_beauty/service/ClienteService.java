package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.ClienteRequest;
import com.example.natural_beauty.dto.ClienteResponse;
import com.example.natural_beauty.model.Cliente;
import com.example.natural_beauty.repository.ClienteRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> trovaTutti() {
        return clienteRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse trovaPerId(Long id) {
        return clienteRepository.findById(id).map(this::toResponse).orElseThrow(() -> notFound(id));
    }

    public ClienteResponse crea(ClienteRequest request) {
        if (clienteRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }
        Cliente c = new Cliente();
        applica(c, request);
        return toResponse(clienteRepository.save(c));
    }

    public ClienteResponse aggiorna(Long id, ClienteRequest request) {
        Cliente c =
                clienteRepository.findById(id).orElseThrow(() -> notFound(id));
        clienteRepository
                .findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(
                        x -> {
                            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
                        });
        applica(c, request);
        return toResponse(clienteRepository.save(c));
    }

    public void elimina(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw notFound(id);
        }
        clienteRepository.deleteById(id);
    }

    Cliente getEntity(Long id) {
        return clienteRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    Cliente getEntityByEmail(String email) {
        return clienteRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void applica(Cliente c, ClienteRequest r) {
        c.setNome(r.nome());
        c.setCognome(r.cognome());
        c.setEmail(r.email());
        c.setTelefono(r.telefono());
        c.setNote(r.note());
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getNome(), c.getCognome(), c.getEmail(), c.getTelefono(), c.getNote());
    }

    private static ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente non trovato: " + id);
    }
}
