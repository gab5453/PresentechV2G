namespace Presentech.Business.DTOs.Calificaciones
{
    public class MatrizCalificacionesResponse
    {
        public int ClaseId { get; set; }
        public List<ActividadDto> Actividades { get; set; } = new List<ActividadDto>();
        public List<EstudianteCalificacionesDto> Estudiantes { get; set; } = new List<EstudianteCalificacionesDto>();
    }

    public class ActividadDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Tipo { get; set; } = null!;
        public DateTime? Fecha { get; set; }
    }

    public class EstudianteCalificacionesDto
    {
        public int EstudianteId { get; set; }
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;
        public Dictionary<int, decimal?> Notas { get; set; } = new Dictionary<int, decimal?>(); // ActividadId -> Nota
        public decimal Promedio { get; set; }
        public bool RequiereAlarma { get; set; }
    }
}
