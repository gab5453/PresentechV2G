namespace Presentech.Business.DTOs.Opinion
{
    public class RegistrarOpinionRequest
    {
        public bool? utilizaria_siguiente_anio { get; set; }
        public int? calificacion_usabilidad { get; set; }
        public string aspecto_mas_util { get; set; } = string.Empty;
        public string aspectos_por_mejorar { get; set; } = string.Empty;
    }

    public class RegistrarOpinionResponse
    {
        public int id_opinion { get; set; }
        public DateTime created_at { get; set; }
    }
}
