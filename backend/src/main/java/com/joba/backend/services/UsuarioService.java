package com.joba.backend.services;

import java.util.List;
import java.util.Optional;

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

        // Leer todos los usuarios
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Leer un usuario por ID
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Crear un nuevo usuario
    public Usuario crearUsuario(Usuario usuario) {
        // Aquí podrías encriptar la contraseña antes de guardar si usas Spring Security
        return usuarioRepository.save(usuario);
    }

    // Actualizar usuario existente
    public Usuario actualizarUsuario(Long id, Usuario detallesUsuario) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        usuario.setCodUsuario(detallesUsuario.getCodUsuario());
        usuario.setNombre(detallesUsuario.getNombre());
        usuario.setApellido(detallesUsuario.getApellido());
        usuario.setCorreo(detallesUsuario.getCorreo());
        usuario.setEspecialidad(detallesUsuario.getEspecialidad());
        usuario.setNivelPermiso(detallesUsuario.getNivelPermiso());
        usuario.setRoles(detallesUsuario.getRoles());
        
        // Solo actualizar contraseña si se envía una nueva
        if (detallesUsuario.getPassword() != null && !detallesUsuario.getPassword().isEmpty()) {
            usuario.setPassword(detallesUsuario.getPassword());
        }

        return usuarioRepository.save(usuario);
    }

    // Borrado lógico (Cambiar estado)
    public void cambiarEstadoUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        
        usuario.setEstado(!usuario.isEstado()); // Alterna entre true/false
        usuarioRepository.save(usuario);
    }
}