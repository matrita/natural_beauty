package com.example.natural_beauty.repository;

import com.example.natural_beauty.model.Trattamento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrattamentoRepository extends JpaRepository<Trattamento, Long> {

    List<Trattamento> findByAttivoTrue();
}
