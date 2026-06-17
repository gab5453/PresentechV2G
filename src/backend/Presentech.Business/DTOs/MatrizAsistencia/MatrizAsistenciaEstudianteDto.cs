namespace Presentech.Business.DTOs.MatrizAsistencia
{
    public class MatrizAsistenciaEstudianteDto
    {
        public int id_estudiante { get; set; }
        public int numero { get; set; }
        public string nombre_estudiante { get; set; } = string.Empty;
        public Dictionary<string, string> estados_por_fecha { get; set; } = new();
        public Dictionary<string, MatrizAsistenciaResumenPeriodoDto> resumen_periodos { get; set; } = new();
        public int total_asistencias { get; set; }
        public int total_faltas { get; set; }
        public int total_parciales { get; set; }
        public string nivel_alerta { get; set; } = "normal";
    }
}
