package com.example.natural_beauty.config;

import com.example.natural_beauty.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS, "/**")
                                        .permitAll()
                                        .requestMatchers("/api/auth/**")
                                        .permitAll()
                                        .requestMatchers("/api/me/**")
                                        .hasRole("CLIENTE")
                                        .requestMatchers(HttpMethod.GET, "/api/appuntamenti/disponibilita")
                                        .authenticated()
                                        .requestMatchers("/api/utenti/**")
                                        .hasRole("ADMIN")
                                        .requestMatchers("/api/clienti/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.POST, "/api/operatori/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.PUT, "/api/operatori/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.DELETE, "/api/operatori/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.POST, "/api/trattamenti/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.PUT, "/api/trattamenti/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers(HttpMethod.DELETE, "/api/trattamenti/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers("/api/appuntamenti/**")
                                        .hasAnyRole("ADMIN", "STAFF")
                                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
