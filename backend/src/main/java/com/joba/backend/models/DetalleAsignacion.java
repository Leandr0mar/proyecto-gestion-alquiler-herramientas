package com.joba.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "detalle_asignacion")
public class DetalleAsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private long id;

    // Relación con ReportesAsignacion (id_asignacion)
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    @JoinColumn(name = "id_asignacion", nullable = false)
    private ReportesAsignacion reporteAsignacion;

    // Relación con Herramientas (id_herramienta)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_herramienta", nullable = false)
    private Herramienta herramienta;

    @NotBlank(message = "El estado de retorno es obligatorio")
    @Size(max = 30, message = "El estado de retorno no puede superar los 30 caracteres")
    @Column(name = "estado_retorno", nullable = false, length = 30)
    private String estadoRetorno;

    public DetalleAsignacion() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public ReportesAsignacion getReporteAsignacion() {
        return reporteAsignacion;
    }

    public void setReporteAsignacion(ReportesAsignacion reporteAsignacion) {
        this.reporteAsignacion = reporteAsignacion;
    }

    public Herramienta getHerramienta() {
        return herramienta;
    }

    public void setHerramienta(Herramienta herramienta) {
        this.herramienta = herramienta;
    }

    public String getEstadoRetorno() {
        return estadoRetorno;
    }

    public void setEstadoRetorno(String estadoRetorno) {
        this.estadoRetorno = estadoRetorno;
    }

}
