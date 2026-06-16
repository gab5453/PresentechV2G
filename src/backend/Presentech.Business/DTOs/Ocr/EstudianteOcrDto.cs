namespace Presentech.Business.DTOs.Ocr
{
    public class EstudianteOcrDto
    {
        public string apellidos { get; set; } = string.Empty;
        public string nombres { get; set; } = string.Empty;
        public decimal confianza { get; set; }
        public string? observacion { get; set; }
    }
}
