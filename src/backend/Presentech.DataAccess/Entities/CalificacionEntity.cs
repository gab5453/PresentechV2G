namespace Presentech.DataAccess.Entities
{
    public class CalificacionEntity
    {
        // =========================
        // CLAVE PRIMARIA
        // =========================
        public int id_calificacion { get; set; }

        // =========================
        // CLAVES FORÁNEAS
        // =========================
        public int id_actividad { get; set; }
        public int id_estudiante { get; set; }

        // =========================
        // DATOS DE LA CALIFICACIÓN
        // =========================
        public decimal nota { get; set; }

        // =========================
        // ESTADO / CICLO DE VIDA
        // =========================
        public DateTime fecha_registro { get; set; } = DateTime.UtcNow;

        // =========================
        // NAVEGACIÓN
        // =========================
        public ActividadEntity Actividad { get; set; } = null!;
        public EstudianteEntity Estudiante { get; set; } = null!;
    }
}
