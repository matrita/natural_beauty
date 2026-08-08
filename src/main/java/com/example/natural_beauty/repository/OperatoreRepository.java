package com.example.natural_beauty.repository;

import com.example.natural_beauty.model.Operatore;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OperatoreRepository extends JpaRepository<Operatore, Long> {

    List<Operatore> findByAttivoTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Operatore o where o.id = :id")
    Optional<Operatore> findByIdWithPessimisticWriteLock(@Param("id") Long id);
}
