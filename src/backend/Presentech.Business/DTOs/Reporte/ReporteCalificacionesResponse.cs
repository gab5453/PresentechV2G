namespace Presentech.Business.DTOs.Reporte
{
    public class ReporteCalificacionesResponse
    {
        public int id_clase { get; set; }
        public string curso { get; set; } = string.Empty;
        public string docente { get; set; } = string.Empty;
        public DateOnly fecha_inicio { get; set; }
        public DateOnly fecha_fin { get; set; }
        public List<ReporteCalificacionEstudianteResponse> estudiantes { get; set; } = new();
        public ReporteCalificacionResumenResponse resumen { get; set; } = new();
        public List<ReporteAlertaResponse> alertas { get; set; } = new();
    }

    public class ReporteCalificacionEstudianteResponse
    {
        public int id_estudiante { get; set; }
        public string nombre_estudiante { get; set; } = string.Empty;
        public string curso { get; set; } = string.Empty;
        public double promedio_parcial { get; set; }
        public double promedio_final { get; set; }
        public string estado { get; set; } = string.Empty; // Aprobado / Riesgo / Reprobado
    }

    public class ReporteCalificacionResumenResponse
    {
        public int total_estudiantes { get; set; }
        public double promedio_curso { get; set; }
        public int aprobados { get; set; }
        public int en_riesgo { get; set; }
        public int reprobados { get; set; }
    }
}
