package com.example.natural_beauty.repository;

import com.example.natural_beauty.model.Operatore;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatoreRepository extends JpaRepository<Operatore, Long> {

    List<Operatore> findByAttivoTrue();
}
