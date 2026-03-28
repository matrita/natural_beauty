package com.example.natural_beauty.repository;

import com.example.natural_beauty.model.Appuntamento;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppuntamentoRepository extends JpaRepository<Appuntamento, Long> {

    List<Appuntamento> findByOperatoreIdAndDataOraInizioBetween(
            Long operatoreId, LocalDateTime inizio, LocalDateTime fine);

    @Query(
            """
            select a from Appuntamento a
            join fetch a.cliente join fetch a.operatore join fetch a.trattamento
            where a.id = :id
            """)
    Optional<Appuntamento> findByIdWithDetails(@Param("id") Long id);

    List<Appuntamento> findByDataOraInizioBetweenOrderByDataOraInizioAsc(
            LocalDateTime inizio, LocalDateTime fine);

    @Query(
            """
            select a from Appuntamento a
            join fetch a.cliente join fetch a.operatore join fetch a.trattamento
            where a.cliente.id = :clienteId
              and a.dataOraInizio between :inizio and :fine
              and a.stato <> com.example.natural_beauty.model.StatoAppuntamento.CANCELLATO
            order by a.dataOraInizio asc
            """)
    List<Appuntamento> findByClienteIdNelPeriodoWithDetails(
            @Param("clienteId") Long clienteId,
            @Param("inizio") LocalDateTime inizio,
            @Param("fine") LocalDateTime fine);

    @Query(
            """
            select a from Appuntamento a
            join fetch a.cliente join fetch a.operatore join fetch a.trattamento
            where a.id = :id and a.cliente.id = :clienteId
            """)
    Optional<Appuntamento> findByIdAndClienteIdWithDetails(
            @Param("id") Long id, @Param("clienteId") Long clienteId);
}
