package com.joba.backend.controllers;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.joba.backend.services.DevolucionService;

@RestController
@RequestMapping("/api/devoluciones")
@CrossOrigin(origins = "http://localhost:5173")
public class DevolucionController {

    private final DevolucionService devolucionService;

    public DevolucionController(DevolucionService devolucionService) {
        this.devolucionService = devolucionService;
    }

    @PostMapping
    public ResponseEntity<?> registrarDevolucion(@RequestBody DevolucionRequest request) {
        try {
            devolucionService.registrarDevolucion(
                request.getIdAsignacion(),
                request.getEstadosDeRetorno()
            );
            return ResponseEntity.ok("Devolución registrada e inventario actualizado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO interno para mapear el JSON de React
    public static class DevolucionRequest {
        private Long idAsignacion;
        // Map donde la Key es el ID de la herramienta y el Value es el "estadoRetorno"
        private Map<Long, String> estadosDeRetorno;

        public Long getIdAsignacion() { return idAsignacion; }
        public void setIdAsignacion(Long idAsignacion) { this.idAsignacion = idAsignacion; }
        public Map<Long, String> getEstadosDeRetorno() { return estadosDeRetorno; }
        public void setEstadosDeRetorno(Map<Long, String> estadosDeRetorno) { this.estadosDeRetorno = estadosDeRetorno; }
    }
}