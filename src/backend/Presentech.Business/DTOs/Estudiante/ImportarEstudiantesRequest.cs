namespace Presentech.Business.DTOs.Estudiante
{
    public class EstudianteImportDto
    {
        public string Cedula { get; set; } = string.Empty;
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
    }

    public class ImportarEstudiantesRequest
    {
        public List<EstudianteImportDto> estudiantes { get; set; } = new();
    }
}
