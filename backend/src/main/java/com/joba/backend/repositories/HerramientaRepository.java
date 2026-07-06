package com.joba.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joba.backend.models.Herramienta;

public interface HerramientaRepository extends JpaRepository<Herramienta,Long> {
     
    // Busca herramientas que estén "Disponible" o "Prestado"
    List<Herramienta> findByDisponibilidad(String disponibilidad);

    Herramienta findByCodigoHerramienta(String codigoHerramienta);
}
