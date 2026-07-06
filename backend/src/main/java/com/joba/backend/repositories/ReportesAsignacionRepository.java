package com.joba.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.models.Usuario;

public interface ReportesAsignacionRepository extends JpaRepository<ReportesAsignacion,Long>{

    // Busca todas las asignaciones hechas a un operario específico
    List<ReportesAsignacion> findByOperario(Usuario operario);
    List<ReportesAsignacion> findByOperarioCodUsuario(String codUsuario);
}
