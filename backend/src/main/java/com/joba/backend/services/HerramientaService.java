package com.joba.backend.services;

import java.util.List;
import org.springframework.stereotype.Service;
import com.joba.backend.models.Herramienta;
import com.joba.backend.repositories.HerramientaRepository;

@Service
public class HerramientaService {

    private final HerramientaRepository herramientaRepository;

    public HerramientaService(HerramientaRepository herramientaRepository) {
        this.herramientaRepository = herramientaRepository;
    }

    public List<Herramienta> obtenerTodoElInventario() {
        return herramientaRepository.findAll();
    }

    public Herramienta registrarNuevaHerramienta(Herramienta nuevaHerramienta) {
        nuevaHerramienta.setDisponibilidad("DISPONIBLE");
        return herramientaRepository.save(nuevaHerramienta);
    }

    // Dar de baja una herramienta (Para el panel del Administrador)
    public Herramienta darDeBaja(Long idHerramienta) {
        Herramienta herramienta = herramientaRepository.findById(idHerramienta)
            .orElseThrow(() -> new RuntimeException("Herramienta no encontrada."));
            
        herramienta.setEstado("BAJA");
        herramienta.setDisponibilidad("NO DISPONIBLE");
        return herramientaRepository.save(herramienta);
    }

    // Método para validar el código QR escaneado
    public Herramienta buscarPorCodigoQR(String codigoQR) {
        Herramienta herramienta = herramientaRepository.findByCodigoHerramienta(codigoQR);
        if (herramienta == null) {
            throw new RuntimeException("Herramienta no encontrada con el código: " + codigoQR);
        }
        return herramienta;
    }
}