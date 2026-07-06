package com.joba.backend.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.joba.backend.models.Herramienta;
import com.joba.backend.services.HerramientaService;

@RestController
@RequestMapping("/api/herramientas")
@CrossOrigin(origins = "http://localhost:5173")
public class HerramientaController {

    private final HerramientaService herramientaService;

    public HerramientaController(HerramientaService herramientaService) {
        this.herramientaService = herramientaService;
    }

    @GetMapping
    public ResponseEntity<List<Herramienta>> obtenerInventario() {
        return ResponseEntity.ok(herramientaService.obtenerTodoElInventario());
    }

    @PostMapping
    public ResponseEntity<Herramienta> registrarHerramienta(@RequestBody Herramienta herramienta) {
        return ResponseEntity.ok(herramientaService.registrarNuevaHerramienta(herramienta));
    }

    // Endpoint consumido por PrestamosView.tsx al escanear el QR
    @GetMapping("/buscar/{codigo}")
    public ResponseEntity<?> buscarPorCodigo(@PathVariable String codigo) {
        try {
            Herramienta herramienta = herramientaService.buscarPorCodigoQR(codigo);
            return ResponseEntity.ok(herramienta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}