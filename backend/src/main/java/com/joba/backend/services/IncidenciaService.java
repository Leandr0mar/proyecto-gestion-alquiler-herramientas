package com.joba.backend.services;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.models.ReportesIncidencia;
import com.joba.backend.repositories.ReportesAsignacionRepository;
import com.joba.backend.repositories.ReportesIncidenciaRepository;

@Service
public class IncidenciaService {

    private final ReportesIncidenciaRepository incidenciaRepository;
    private final ReportesAsignacionRepository asignacionRepository;

    public IncidenciaService(ReportesIncidenciaRepository incidenciaRepository, ReportesAsignacionRepository asignacionRepository) {
        this.incidenciaRepository = incidenciaRepository;
        this.asignacionRepository = asignacionRepository;
    }

    @Transactional
    public ReportesIncidencia registrarIncidencia(Long idAsignacion, String tipoIncidencia, String detalleIncidencia) {
        ReportesAsignacion asignacion = asignacionRepository.findById(idAsignacion)
            .orElseThrow(() -> new RuntimeException("El código de asignación no existe."));

        ReportesIncidencia incidencia = new ReportesIncidencia();
        incidencia.setReporteAsignacion(asignacion);
        incidencia.setFechaReporte(LocalDateTime.now());
        incidencia.setTipoIncidencia(tipoIncidencia);
        incidencia.setDetalleIncidencia(detalleIncidencia);

        return incidenciaRepository.save(incidencia);
    }
}