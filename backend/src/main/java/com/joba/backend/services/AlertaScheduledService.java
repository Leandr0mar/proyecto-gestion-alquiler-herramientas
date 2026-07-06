package com.joba.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.repositories.ReportesAsignacionRepository;

@Service
public class AlertaScheduledService {

    private final ReportesAsignacionRepository asignacionRepository;

    public AlertaScheduledService(ReportesAsignacionRepository asignacionRepository) {
        this.asignacionRepository = asignacionRepository;
    }

    // Se ejecuta diariamente a la medianoche
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional(readOnly = true)
    public void generarAlertasRetrasoDiarias() {
        LocalDateTime ahora = LocalDateTime.now();
        List<ReportesAsignacion> todos = asignacionRepository.findAll();

        List<ReportesAsignacion> vencidos = todos.stream()
            .filter(p -> p.getFechaDevolucion().isBefore(ahora))
            .filter(p -> p.getDetalles().stream().anyMatch(d -> d.getEstadoRetorno().equals("PENDIENTE")))
            .collect(Collectors.toList());

        for (ReportesAsignacion p : vencidos) {
            System.out.println("ALERTA: Préstamo vencido - Operario ID: " + p.getOperario().getId());
        }
    }

    public List<ReportesAsignacion> obtenerPrestamosVencidos() {
        LocalDateTime ahora = LocalDateTime.now();
        return asignacionRepository.findAll().stream()
            .filter(p -> p.getFechaDevolucion().isBefore(ahora))
            .filter(p -> p.getDetalles().stream().anyMatch(d -> d.getEstadoRetorno().equals("PENDIENTE")))
            .collect(Collectors.toList());
    }
}