package com.joba.backend.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.joba.backend.models.Herramienta;
import com.joba.backend.models.ReportesIncidencia;
import com.joba.backend.services.AdminAuditoriaService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminAuditoriaService adminAuditoriaService;

    public AdminController(AdminAuditoriaService adminAuditoriaService) {
        this.adminAuditoriaService = adminAuditoriaService;
    }

    // Obtener la lista de incidencias para la tabla de Auditoría
    @GetMapping("/incidencias")
    public ResponseEntity<List<ReportesIncidencia>> obtenerIncidenciasPendientes() {
        return ResponseEntity.ok(adminAuditoriaService.obtenerIncidenciasParaAuditoria());
    }

    // Aprobar la baja de una herramienta (Cambiar su estado a BAJA DEFINITIVA)
    @PutMapping("/herramientas/{idHerramienta}/baja")
    public ResponseEntity<?> aprobarBajaDefinitiva(@PathVariable Long idHerramienta) {
        try {
            Herramienta herramientaDadaDeBaja = adminAuditoriaService.aprobarBajaDefinitiva(idHerramienta);
            return ResponseEntity.ok(herramientaDadaDeBaja);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para alimentar los gráficos del Dashboard del Administrador
    @GetMapping("/estadisticas/incidencias/conteo")
    public ResponseEntity<Long> contarIncidenciasPorTipo(@RequestParam String tipo) {
        Long cantidad = adminAuditoriaService.contarIncidenciasPorTipo(tipo);
        return ResponseEntity.ok(cantidad);
    }
}