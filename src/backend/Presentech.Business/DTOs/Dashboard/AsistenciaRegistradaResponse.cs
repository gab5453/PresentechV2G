namespace Presentech.Business.DTOs.Dashboard
{
    public class AsistenciaRegistradaResponse
    {
        public int id_registro { get; set; }
        public DateOnly fecha { get; set; }
        public DateTime created_at { get; set; }
        public int id_profesor { get; set; }
        public string docente { get; set; } = string.Empty;
        public string materia { get; set; } = string.Empty;
        public string paralelo { get; set; } = string.Empty;
        public string dia { get; set; } = string.Empty;
        public string hora_inicio { get; set; } = string.Empty;
        public string hora_fin { get; set; } = string.Empty;
        public int total_estudiantes { get; set; }
        public int total_presentes { get; set; }
        public int total_ausentes { get; set; }
        public int total_atrasados { get; set; }
    }
}
