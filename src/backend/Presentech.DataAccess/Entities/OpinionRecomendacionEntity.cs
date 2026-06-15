namespace Presentech.DataAccess.Entities
{
    public class OpinionRecomendacionEntity
    {
        public int id_opinion { get; set; }
        public int id_profesor { get; set; }
        public bool utilizaria_siguiente_anio { get; set; }
        public string aspecto_mas_util { get; set; } = null!;
        public string aspectos_por_mejorar { get; set; } = null!;
        public DateTime created_at { get; set; }

        public ProfesorEntity Profesor { get; set; } = null!;
    }
}
