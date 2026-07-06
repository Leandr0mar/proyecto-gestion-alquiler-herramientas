package com.joba.backend.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="reportes_asignacion")
public class ReportesAsignacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // Relación con el Operario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_operario", nullable = false)
    private Usuario operario;

    // Relación con el Almacenero
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_almacenero", nullable = false)
    private Usuario almacenero;

    @Column(name = "fecha_salida", columnDefinition = "DATETIME")
    private LocalDateTime fechaSalida;

    @Column(name = "fecha_devolucion", columnDefinition = "DATETIME")
    private LocalDateTime fechaDevolucion;

    @OneToMany(mappedBy = "reporteAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleAsignacion> detalles = new ArrayList<>();

    public ReportesAsignacion() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Usuario getOperario() {
        return operario;
    }

    public void setOperario(Usuario operario) {
        this.operario = operario;
    }

    public Usuario getAlmacenero() {
        return almacenero;
    }

    public void setAlmacenero(Usuario almacenero) {
        this.almacenero = almacenero;
    }

    public LocalDateTime getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDateTime fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public LocalDateTime getFechaDevolucion() {
        return fechaDevolucion;
    }

    public void setFechaDevolucion(LocalDateTime fechaDevolucion) {
        this.fechaDevolucion = fechaDevolucion;
    }

    public List<DetalleAsignacion> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleAsignacion> detalles) {
        this.detalles = detalles;
    }

}
