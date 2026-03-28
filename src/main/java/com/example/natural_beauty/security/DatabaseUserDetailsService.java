package com.example.natural_beauty.security;

import com.example.natural_beauty.model.Utente;
import com.example.natural_beauty.repository.UtenteRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UtenteRepository utenteRepository;

    public DatabaseUserDetailsService(UtenteRepository utenteRepository) {
        this.utenteRepository = utenteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utente u =
                utenteRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + email));
        return User.builder()
                .username(u.getEmail())
                .password(u.getPasswordHash())
                .roles(u.getRuolo().name())
                .build();
    }
}
