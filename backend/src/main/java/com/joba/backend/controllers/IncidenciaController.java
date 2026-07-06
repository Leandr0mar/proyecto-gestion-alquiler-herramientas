package com.joba.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.joba.backend.models.ReportesIncidencia;
import com.joba.backend.services.IncidenciaService;

@RestController
@RequestMapping("/api/incidencias")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @PostMapping
    public ResponseEntity<?> registrarIncidencia(@RequestBody IncidenciaRequest request) {
        try {
            ReportesIncidencia incidencia = incidenciaService.registrarIncidencia(
                request.getIdAsignacion(),
                request.getTipoIncidencia(),
                request.getDetalleIncidencia()
            );
            return ResponseEntity.ok(incidencia);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class IncidenciaRequest {
        private Long idAsignacion;
        private String tipoIncidencia;
        private String detalleIncidencia;

        public Long getIdAsignacion() { return idAsignacion; }
        public void setIdAsignacion(Long idAsignacion) { this.idAsignacion = idAsignacion; }
        public String getTipoIncidencia() { return tipoIncidencia; }
        public void setTipoIncidencia(String tipoIncidencia) { this.tipoIncidencia = tipoIncidencia; }
        public String getDetalleIncidencia() { return detalleIncidencia; }
        public void setDetalleIncidencia(String detalleIncidencia) { this.detalleIncidencia = detalleIncidencia; }
    }
}