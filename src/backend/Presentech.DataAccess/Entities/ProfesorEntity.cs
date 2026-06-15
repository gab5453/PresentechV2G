namespace Presentech.DataAccess.Entities
{
    public class ProfesorEntity
    {
        // =========================
        // CLAVE PRIMARIA
        // =========================
        public int id_profesor { get; set; }

        // =========================
        // DATOS PERSONALES
        // =========================
        public string nombres { get; set; } = null!;
        public string apellidos { get; set; } = null!;

        // =========================
        // DATOS DE CONTACTO
        // =========================
        public string correo_institucional { get; set; } = null!;
        public string? telefono { get; set; }
        public string? especialidad { get; set; }

        // =========================
        // AUTENTICACIÓN
        // =========================
        public string contrasena_hash { get; set; } = null!;

        // =========================
        // ESTADO / CICLO DE VIDA
        // =========================
        public bool activo { get; set; }
        public DateTime created_at { get; set; }

        // =========================
        // NAVEGACIÓN
        // =========================
        public ICollection<ClaseEntity> Clases { get; set; } = new List<ClaseEntity>();
        public ICollection<OpinionRecomendacionEntity> OpinionesRecomendaciones { get; set; } = new List<OpinionRecomendacionEntity>();
    }
}
