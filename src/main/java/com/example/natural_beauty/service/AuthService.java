package com.example.natural_beauty.service;

import com.example.natural_beauty.dto.LoginRequest;
import com.example.natural_beauty.dto.LoginResponse;
import com.example.natural_beauty.dto.RegisterRequest;
import com.example.natural_beauty.model.Cliente;
import com.example.natural_beauty.model.Utente;
import com.example.natural_beauty.model.UtenteRuolo;
import com.example.natural_beauty.repository.ClienteRepository;
import com.example.natural_beauty.repository.UtenteRepository;
import com.example.natural_beauty.security.DatabaseUserDetailsService;
import com.example.natural_beauty.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final DatabaseUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UtenteRepository utenteRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final long jwtExpirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            DatabaseUserDetailsService userDetailsService,
            JwtService jwtService,
            UtenteRepository utenteRepository,
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.utenteRepository = utenteRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o password non validi");
        }
        UserDetails user = userDetailsService.loadUserByUsername(request.email());
        String token = jwtService.generateToken(user);
        String ruolo =
                utenteRepository
                        .findByEmail(request.email())
                        .map(u -> u.getRuolo().name())
                        .orElse("STAFF");
        return LoginResponse.of(token, jwtExpirationMs / 1000, request.email(), ruolo);
    }

    public LoginResponse register(RegisterRequest request) {
        if (utenteRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }
        if (clienteRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }
        Utente u = new Utente();
        u.setEmail(request.email());
        u.setPasswordHash(passwordEncoder.encode(request.password()));
        u.setRuolo(UtenteRuolo.CLIENTE);
        utenteRepository.save(u);

        Cliente c = new Cliente();
        c.setNome(request.nome());
        c.setCognome(request.cognome());
        c.setEmail(request.email());
        c.setTelefono(request.telefono());
        c.setNote(null);
        clienteRepository.save(c);

        UserDetails user = userDetailsService.loadUserByUsername(request.email());
        String token = jwtService.generateToken(user);
        return LoginResponse.of(token, jwtExpirationMs / 1000, request.email(), u.getRuolo().name());
    }
}
