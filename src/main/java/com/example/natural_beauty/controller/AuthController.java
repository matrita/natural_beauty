package com.example.natural_beauty.controller;

import com.example.natural_beauty.dto.LoginRequest;
import com.example.natural_beauty.dto.LoginResponse;
import com.example.natural_beauty.dto.RegisterRequest;
import com.example.natural_beauty.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint di autenticazione (JWT).
 *
 * <p>Note ruoli:
 *
 * <ul>
 *   <li>La registrazione crea sempre un utente con ruolo {@code CLIENTE}.
 *   <li>Il login restituisce un token JWT da usare nelle richieste successive su {@code /api/**}.
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Login con email e password. Ritorna {@link LoginResponse} con token JWT. */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    /** Registrazione nuovo utente cliente. Ritorna {@link LoginResponse} con token JWT. */
    @PostMapping("/register")
    public LoginResponse register(@RequestBody @Valid RegisterRequest request) {
        return authService.register(request);
    }
}
