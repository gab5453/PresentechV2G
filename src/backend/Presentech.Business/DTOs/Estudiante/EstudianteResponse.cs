namespace Presentech.Business.DTOs.Estudiante
{
    public class EstudianteResponse
    {
        public int id_estudiante { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
    }
}
