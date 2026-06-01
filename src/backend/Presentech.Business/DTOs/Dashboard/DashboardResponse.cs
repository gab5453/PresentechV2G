namespace Presentech.Business.DTOs.Dashboard
{
    public class DashboardResponse
    {
        public int total_estudiantes { get; set; }
        public int total_clases { get; set; }
        public int total_estudiantes_riesgo { get; set; }
        public double porcentaje_asistencia_global { get; set; }
        public List<EstudianteRiesgoDTO> estudiantes_en_riesgo { get; set; } = new List<EstudianteRiesgoDTO>();
    }

    public class EstudianteRiesgoDTO
    {
        public int id_estudiante { get; set; }
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
        public int numero_faltas { get; set; }
        public List<string> clases_afectadas { get; set; } = new List<string>();
    }
}
