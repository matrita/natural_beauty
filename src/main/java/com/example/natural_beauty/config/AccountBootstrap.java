package com.example.natural_beauty.config;

import com.example.natural_beauty.model.Utente;
import com.example.natural_beauty.model.UtenteRuolo;
import com.example.natural_beauty.repository.UtenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AccountBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AccountBootstrap.class);

    @Bean
    CommandLineRunner creaAdminSeAssente(
            UtenteRepository utenteRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.security.bootstrap.email}") String bootstrapEmail,
            @Value("${app.security.bootstrap.password}") String bootstrapPassword) {
        return args -> {
            if (utenteRepository.existsByEmail(bootstrapEmail)) {
                return;
            }
            Utente u = new Utente();
            u.setEmail(bootstrapEmail);
            u.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
            u.setRuolo(UtenteRuolo.ADMIN);
            utenteRepository.save(u);
            log.warn(
                    "Creato utente iniziale ADMIN {} (imposta credenziali sicure in app.security.bootstrap.*)",
                    bootstrapEmail);
        };
    }
}
