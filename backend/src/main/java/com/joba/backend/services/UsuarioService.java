package com.joba.backend.services;

import org.springframework.stereotype.Service;
import com.joba.backend.models.Usuario;
import com.joba.backend.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario autenticarUsuario(String correo, String contrasenia) {
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario == null || !usuario.getPassword().equals(contrasenia)) {
            throw new RuntimeException("Credenciales incorrectas.");
        }
        if (!usuario.isEstado()) {
            throw new RuntimeException("Usuario inactivo.");
        }
        return usuario;
    }

    public Usuario buscarPorDni(String dni) {
        Usuario usuario = usuarioRepository.findByCodUsuario(dni);
        if (usuario == null) {
            throw new RuntimeException("Operario no encontrado con el DNI: " + dni);
        }
        return usuario;
    }
}