package com.joba.backend.services;

import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.joba.backend.models.DetalleAsignacion;
import com.joba.backend.models.Herramienta;
import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.repositories.HerramientaRepository;
import com.joba.backend.repositories.ReportesAsignacionRepository;

@Service
public class DevolucionService {

    private final ReportesAsignacionRepository asignacionRepository;
    private final HerramientaRepository herramientaRepository;

    public DevolucionService(ReportesAsignacionRepository asignacionRepository, HerramientaRepository herramientaRepository) {
        this.asignacionRepository = asignacionRepository;
        this.herramientaRepository = herramientaRepository;
    }

    @Transactional
    public void registrarDevolucion(Long idAsignacion, Map<Long, String> estadosDeRetorno) {
        ReportesAsignacion reporte = asignacionRepository.findById(idAsignacion)
            .orElseThrow(() -> new RuntimeException("Préstamo no encontrado."));

        for (DetalleAsignacion detalle : reporte.getDetalles()) {
            Long idHerramienta = detalle.getHerramienta().getId();
            
            if (estadosDeRetorno.containsKey(idHerramienta)) {
                String estadoReportado = estadosDeRetorno.get(idHerramienta);
                detalle.setEstadoRetorno(estadoReportado);
                
                Herramienta herramientaFisica = detalle.getHerramienta();
                if (estadoReportado.equals("Buen Estado")) {
                    herramientaFisica.setDisponibilidad("DISPONIBLE");
                } else {
                    herramientaFisica.setDisponibilidad("NO DISPONIBLE");
                    herramientaFisica.setEstado(estadoReportado);
                }
                herramientaRepository.save(herramientaFisica);
            }
        }
        asignacionRepository.save(reporte);
    }
}