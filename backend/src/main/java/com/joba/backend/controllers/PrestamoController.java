package com.joba.backend.controllers;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.services.PrestamoService;

@RestController
@RequestMapping("/api/prestamos")
@CrossOrigin(origins = "http://localhost:5173")
public class PrestamoController {

    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @PostMapping
    public ResponseEntity<?> registrarPrestamo(@RequestBody PrestamoRequest request) {
        try {
            ReportesAsignacion reporte = prestamoService.registrarPrestamo(
                request.getDniOperario(),
                request.getIdAlmacenero(),
                request.getCodigosQR(),
                request.getFechaDevolucion()
            );
            return ResponseEntity.ok(reporte);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO interno estructurado para recibir exactamente lo que React envía
    public static class PrestamoRequest {
        private String dniOperario;
        private Long idAlmacenero;
        private List<String> codigosQR;
        private LocalDateTime fechaDevolucion;

        public String getDniOperario() { return dniOperario; }
        public void setDniOperario(String dniOperario) { this.dniOperario = dniOperario; }
        public Long getIdAlmacenero() { return idAlmacenero; }
        public void setIdAlmacenero(Long idAlmacenero) { this.idAlmacenero = idAlmacenero; }
        public List<String> getCodigosQR() { return codigosQR; }
        public void setCodigosQR(List<String> codigosQR) { this.codigosQR = codigosQR; }
        public LocalDateTime getFechaDevolucion() { return fechaDevolucion; }
        public void setFechaDevolucion(LocalDateTime fechaDevolucion) { this.fechaDevolucion = fechaDevolucion; }
    }

    @GetMapping("/activos/{dni}")
    public ResponseEntity<?> obtenerPrestamoActivo(@PathVariable String dni) {
        try {
            ReportesAsignacion reporteActivo = prestamoService.obtenerPrestamoActivoPorDni(dni);
            return ResponseEntity.ok(reporteActivo);
        } catch (RuntimeException e) {
            // Devolvemos 404 Not Found para que React sepa que no hay préstamos activos
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/historial")
    public ResponseEntity<List<ReportesAsignacion>> obtenerHistorial() {
        return ResponseEntity.ok(prestamoService.obtenerTodosLosPrestamos());
    }
}