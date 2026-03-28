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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public LoginResponse register(@RequestBody @Valid RegisterRequest request) {
        return authService.register(request);
    }
}
