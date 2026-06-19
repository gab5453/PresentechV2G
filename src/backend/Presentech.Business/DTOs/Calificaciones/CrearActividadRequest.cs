namespace Presentech.Business.DTOs.Calificaciones
{
    public class CrearActividadRequest
    {
        public int ClaseId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Tipo { get; set; } = null!; // Deber, Leccion, etc.
        public DateTime? Fecha { get; set; }
    }
}
