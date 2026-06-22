namespace Presentech.DataManagement.Models
{
    public class EstudianteDataModel
    {
        // =========================
        // CLAVE PRIMARIA
        // =========================
        public int id_estudiante { get; set; }

        // =========================
        // DATOS PERSONALES
        // =========================
        public string Cedula { get; set; } = null!;
        public string nombres { get; set; } = null!;
        public string apellidos { get; set; } = null!;

        // =========================
        // ESTADO / CICLO DE VIDA
        // =========================
        public bool activo { get; set; }
        public DateTime created_at { get; set; }
        public List<int> IdParalelos { get; set; } = new();
    }
}
