package com.joba.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joba.backend.models.DetalleAsignacion;
import com.joba.backend.models.ReportesAsignacion;

public interface DetalleAsignacionRepository extends JpaRepository<DetalleAsignacion,Long>{

    // Recupera todas las filas de detalle que pertenezcan a un reporte de asignación específico
    List<DetalleAsignacion> findByReporteAsignacion(ReportesAsignacion asignacion);

}
