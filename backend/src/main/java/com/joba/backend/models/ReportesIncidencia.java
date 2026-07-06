package com.joba.backend.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="reportes_incidencia")
public class ReportesIncidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // ¡AQUÍ ES DONDE BORRAMOS EL @JsonIgnore!
    @ManyToOne
    @JoinColumn(name = "id_reporte_asignacion")
    private ReportesAsignacion reporteAsignacion;

    @Column(name = "fecha_reporte", columnDefinition = "DATETIME")
    private LocalDateTime fechaReporte;

    @Column(name = "tipo_incidencia", length = 50)
    private String tipoIncidencia;

    @Column(name = "detalle_incidencia", columnDefinition = "TEXT")
    private String detalleIncidencia;

    public ReportesIncidencia() {
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

    public LocalDateTime getFechaReporte() {
        return fechaReporte;
    }

    public void setFechaReporte(LocalDateTime fechaReporte) {
        this.fechaReporte = fechaReporte;
    }

    public String getDetalleIncidencia() {
        return detalleIncidencia;
    }

    public void setDetalleIncidencia(String detalleIncidencia) {
        this.detalleIncidencia = detalleIncidencia;
    }

    public String getTipoIncidencia() {
        return tipoIncidencia;
    }

    public void setTipoIncidencia(String tipoIncidencia) {
        this.tipoIncidencia = tipoIncidencia;
    }

    
}
