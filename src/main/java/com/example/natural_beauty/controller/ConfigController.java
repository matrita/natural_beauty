package com.example.natural_beauty.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${app.orario.apertura:09:00}")
    private String apertura;

    @Value("${app.orario.chiusura:18:00}")
    private String chiusura;

    @GetMapping("/orari")
    public Map<String, String> getOrari() {
        return Map.of(
            "apertura", apertura,
            "chiusura", chiusura
        );
    }
}
