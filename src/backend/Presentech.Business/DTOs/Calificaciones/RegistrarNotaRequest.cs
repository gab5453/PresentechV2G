namespace Presentech.Business.DTOs.Calificaciones
{
    public class RegistrarNotaRequest
    {
        public int ActividadId { get; set; }
        public int EstudianteId { get; set; }
        public decimal Nota { get; set; }
    }
}
