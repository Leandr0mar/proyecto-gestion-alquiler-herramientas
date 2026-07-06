package com.joba.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joba.backend.models.ReportesIncidencia;

public interface ReportesIncidenciaRepository extends JpaRepository<ReportesIncidencia, Long> {
    // Aquí puedes agregar métodos personalizados si es necesario

}
