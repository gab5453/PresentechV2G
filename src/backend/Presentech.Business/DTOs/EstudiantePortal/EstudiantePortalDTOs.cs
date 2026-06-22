namespace Presentech.Business.DTOs.EstudiantePortal
{
    public class EstudianteDashboardResponse
    {
        public List<string> Alarmas { get; set; } = new();
        public decimal PromedioGlobal { get; set; }
        public int ClasesMatriculadas { get; set; }
    }

    public class EstudianteClaseDto
    {
        public int IdClase { get; set; }
        public string Materia { get; set; } = string.Empty;
        public string Paralelo { get; set; } = string.Empty;
    }

    public class EstudianteClaseResumenResponse
    {
        public List<EstudianteNotaDto> Notas { get; set; } = new();
        public List<EstudianteAsistenciaDto> Asistencias { get; set; } = new();
    }

    public class EstudianteNotaDto
    {
        public string Actividad { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public decimal Nota { get; set; }
        public decimal Peso { get; set; }
    }

    public class EstudianteAsistenciaDto
    {
        public DateTime Fecha { get; set; }
        public bool Presente { get; set; }
    }
}
