package com.joba.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joba.backend.models.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario,Long>{
    
    // Método personalizado para buscar por correo (Spring genera la consulta automáticamente)
    Usuario findByCorreo(String correo);
    
    // Método personalizado para verificar si un código de usuario ya existe
    boolean existsByCodUsuario(String codUsuario);

    Usuario findByCodUsuario(String codUsuario);
}
