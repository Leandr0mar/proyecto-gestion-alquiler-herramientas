package com.joba.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "herramientas")
public class Herramienta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_herramienta")
    private long id;

    @NotBlank(message = "El código de la herramienta es obligatorio")
    @Size(max = 50, message = "El código no puede superar los 50 caracteres")
    @Column(name = "codigo_herramienta", nullable = false, length = 50, unique = true)
    private String codigoHerramienta;

    @NotBlank(message = "El nombre de la herramienta es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(name = "nombre_herramienta", nullable = false, length = 100)
    private String nombreHerramienta;

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 50, message = "La categoría no puede superar los 50 caracteres")
    @Column(nullable = false, length = 50)
    private String categoria;

    @NotBlank(message = "La disponibilidad es obligatoria")
    @Size(max = 30, message = "La disponibilidad no puede superar los 30 caracteres")
    @Column(nullable = false, length = 30)
    private String disponibilidad;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 30, message = "El estado no puede superar los 30 caracteres")
    @Column(nullable = false, length = 30)
    private String estado;

    public Herramienta() {
    }

    public Long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getCodigoHerramienta() {
        return codigoHerramienta;
    }

    public void setCodigoHerramienta(String codigoHerramienta) {
        this.codigoHerramienta = codigoHerramienta;
    }

    public String getNombreHerramienta() {
        return nombreHerramienta;
    }

    public void setNombreHerramienta(String nombreHerramienta) {
        this.nombreHerramienta = nombreHerramienta;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDisponibilidad() {
        return disponibilidad;
    }

    public void setDisponibilidad(String disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}
