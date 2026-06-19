namespace Presentech.DataAccess.Entities
{
    public class ActividadEntity
    {
        // =========================
        // CLAVE PRIMARIA
        // =========================
        public int id_actividad { get; set; }

        // =========================
        // CLAVES FORÁNEAS
        // =========================
        public int id_clase { get; set; }

        // =========================
        // DATOS DE LA ACTIVIDAD
        // =========================
        public string nombre { get; set; } = null!;
        public string tipo { get; set; } = null!; // Deber, Taller, Leccion, Participacion, etc.
        public DateTime? fecha { get; set; }

        // =========================
        // ESTADO / CICLO DE VIDA
        // =========================
        public bool activo { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // =========================
        // NAVEGACIÓN
        // =========================
        public ClaseEntity Clase { get; set; } = null!;
        public ICollection<CalificacionEntity> Calificaciones { get; set; } = new List<CalificacionEntity>();
    }
}
