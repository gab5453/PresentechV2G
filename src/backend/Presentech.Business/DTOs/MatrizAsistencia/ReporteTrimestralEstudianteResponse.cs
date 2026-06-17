namespace Presentech.Business.DTOs.MatrizAsistencia
{
    public class ReporteTrimestralEstudianteResponse
    {
        public int id_estudiante { get; set; }
        public string nombre_estudiante { get; set; } = string.Empty;
        public int id_paralelo { get; set; }
        public string paralelo { get; set; } = string.Empty;
        public string anio_lectivo { get; set; } = string.Empty;
        public DateOnly fecha_inicio { get; set; }
        public DateOnly fecha_fin { get; set; }
        public List<ReporteTrimestralMateriaDto> materias { get; set; } = new();
        public ReporteTrimestralResumenDto resumen { get; set; } = new();
    }

    public class ReporteTrimestralMateriaDto
    {
        public int id_materia { get; set; }
        public string materia { get; set; } = string.Empty;
        public ReporteTrimestralResumenDto periodo_1 { get; set; } = new();
        public ReporteTrimestralResumenDto periodo_2 { get; set; } = new();
        public ReporteTrimestralResumenDto periodo_3 { get; set; } = new();
        public ReporteTrimestralResumenDto total { get; set; } = new();
    }

    public class ReporteTrimestralResumenDto
    {
        public int asistencias { get; set; }
        public int faltas { get; set; }
        public int parciales { get; set; }
    }
}
