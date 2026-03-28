package com.example.natural_beauty.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appuntamenti")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appuntamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operatore_id", nullable = false)
    private Operatore operatore;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trattamento_id", nullable = false)
    private Trattamento trattamento;

    @Column(nullable = false)
    private LocalDateTime dataOraInizio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatoAppuntamento stato = StatoAppuntamento.PRENOTATO;

    @Column(length = 2000)
    private String note;
}
