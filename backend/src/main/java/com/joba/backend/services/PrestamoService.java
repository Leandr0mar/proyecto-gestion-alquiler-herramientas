package com.joba.backend.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.joba.backend.models.DetalleAsignacion;
import com.joba.backend.models.Herramienta;
import com.joba.backend.models.ReportesAsignacion;
import com.joba.backend.models.Usuario;
import com.joba.backend.repositories.HerramientaRepository;
import com.joba.backend.repositories.ReportesAsignacionRepository;
import com.joba.backend.repositories.UsuarioRepository;

@Service
public class PrestamoService {

    private final ReportesAsignacionRepository asignacionRepository;
    private final HerramientaRepository herramientaRepository;
    private final UsuarioRepository usuarioRepository;

    public PrestamoService(
            ReportesAsignacionRepository asignacionRepository,
            HerramientaRepository herramientaRepository,
            UsuarioRepository usuarioRepository) {
        this.asignacionRepository = asignacionRepository;
        this.herramientaRepository = herramientaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional // Garantiza el principio Todo o Nada (Rollback en caso de error)
    public ReportesAsignacion registrarPrestamo(String dniOperario, Long idAlmacenero, List<String> codigosQR, LocalDateTime fechaDevolucion) {
        
        // 1. Validar Operario (Asumiendo que codUsuario es el DNI)
        Usuario operario = usuarioRepository.findByCodUsuario(dniOperario);
        if (operario == null) {
            throw new RuntimeException("Operario no encontrado o no registrado.");
        }

        // 2. Validar Almacenero
        Usuario almacenero = usuarioRepository.findById(idAlmacenero)
            .orElseThrow(() -> new RuntimeException("Almacenero no válido."));

        // 3. Crear la Cabecera del Reporte
        ReportesAsignacion reporte = new ReportesAsignacion();
        reporte.setOperario(operario);
        reporte.setAlmacenero(almacenero);
        reporte.setFechaSalida(LocalDateTime.now());
        reporte.setFechaDevolucion(fechaDevolucion);

        // 4. Procesar las Herramientas y agregar los Detalles
        for (String qr : codigosQR) {
            // Se asume que agregarás un método findByCodigoHerramienta en HerramientaRepository
            Herramienta herramienta = herramientaRepository.findByCodigoHerramienta(qr);
            if (herramienta == null) {
                throw new RuntimeException("Herramienta QR " + qr + " no existe.");
            }

            if (!herramienta.getDisponibilidad().equals("DISPONIBLE")) {
                throw new RuntimeException("La herramienta " + herramienta.getNombreHerramienta() + " no está disponible.");
            }

            // Cambiar estado del activo
            herramienta.setDisponibilidad("PRESTADO");
            herramientaRepository.save(herramienta);

            // Crear línea de detalle
            DetalleAsignacion detalle = new DetalleAsignacion();
            detalle.setReporteAsignacion(reporte);
            detalle.setHerramienta(herramienta);
            detalle.setEstadoRetorno("PENDIENTE");

            reporte.getDetalles().add(detalle);
        }

        // 5. Guardar todo en cascada (Inserta Cabecera y Detalles de un solo golpe)
        return asignacionRepository.save(reporte);
    }

    public ReportesAsignacion obtenerPrestamoActivoPorDni(String dni) {
        // Obtenemos el historial completo de préstamos de este operario
        List<ReportesAsignacion> historial = asignacionRepository.findByOperarioCodUsuario(dni);
        
        // Filtramos para encontrar el préstamo que aún no ha sido devuelto
        for (ReportesAsignacion asignacion : historial) {
            boolean estaActivo = asignacion.getDetalles().stream()
                .anyMatch(detalle -> "PENDIENTE".equals(detalle.getEstadoRetorno()));
            
            if (estaActivo) {
                return asignacion; // Retornamos el activo
            }
        }
        
        // Si termina el bucle y no hay nada activo, lanzamos error para que React muestre el mensaje en rojo
        throw new RuntimeException("No se encontró ningún préstamo activo o pendiente para el DNI: " + dni);
    }    

    public List<ReportesAsignacion> obtenerTodosLosPrestamos() {
        return asignacionRepository.findAll();
    }
}