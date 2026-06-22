namespace Presentech.DataAccess.Entities
{
    public class EstudianteEntity
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

        // =========================
        // NAVEGACIÓN
        // =========================
        public ICollection<ParaleloEstudianteEntity> ParaleloEstudiantes { get; set; } = new List<ParaleloEstudianteEntity>();
        public ICollection<AsistenciaEntity> Asistencias { get; set; } = new List<AsistenciaEntity>();
        public ICollection<CalificacionEntity> Calificaciones { get; set; } = new List<CalificacionEntity>();
    }
}
