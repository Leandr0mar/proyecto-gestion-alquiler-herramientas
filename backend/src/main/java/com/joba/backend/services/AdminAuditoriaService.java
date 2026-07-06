package com.joba.backend.services;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.joba.backend.models.Herramienta;
import com.joba.backend.models.ReportesIncidencia;
import com.joba.backend.repositories.HerramientaRepository;
import com.joba.backend.repositories.ReportesIncidenciaRepository;

@Service
public class AdminAuditoriaService {

    private final ReportesIncidenciaRepository incidenciaRepository;
    private final HerramientaRepository herramientaRepository;

    public AdminAuditoriaService(ReportesIncidenciaRepository incidenciaRepository, HerramientaRepository herramientaRepository) {
        this.incidenciaRepository = incidenciaRepository;
        this.herramientaRepository = herramientaRepository;
    }

    public List<ReportesIncidencia> obtenerIncidenciasParaAuditoria() {
        return incidenciaRepository.findAll();
    }

    @Transactional
    public Herramienta aprobarBajaDefinitiva(Long idHerramienta) {
        Herramienta herramienta = herramientaRepository.findById(idHerramienta)
            .orElseThrow(() -> new RuntimeException("Herramienta no encontrada."));

        herramienta.setEstado("BAJA DEFINITIVA");
        herramienta.setDisponibilidad("BAJA");
        
        return herramientaRepository.save(herramienta);
    }
    
    // --- Métodos para alimentar el Dashboard de React (KPIs) ---
    // Cuenta cuántas incidencias hay reportadas por un tipo específico (Ej: "Robo")
    public long contarIncidenciasPorTipo(String tipoIncidencia) {
        return incidenciaRepository.findAll().stream()
            .filter(i -> i.getTipoIncidencia().equalsIgnoreCase(tipoIncidencia))
            .count();
    }

    // Calcula el total de herramientas en un estado específico
    public long calcularTotalHerramientasPorEstado(String estado) {
        List<Herramienta> herramientas = herramientaRepository.findAll();
        return herramientas.stream()
            .filter(h -> h.getEstado().equalsIgnoreCase(estado))
            .count();
    }
}