namespace Presentech.DataAccess.Entities
{
    public class ClaseEntity
    {
        // =========================
        // CLAVE PRIMARIA
        // =========================
        public int id_clase { get; set; }

        // =========================
        // CLAVES FORÁNEAS
        // =========================
        public int id_profesor { get; set; }
        public int id_paralelo { get; set; }

        // =========================
        // DATOS DE LA CLASE
        // =========================
        public int id_materia { get; set; }
        public string? observaciones { get; set; }

        // =========================
        // ESTADO / CICLO DE VIDA
        // =========================
        public bool activo { get; set; }
        public DateTime created_at { get; set; }

        // =========================
        // NAVEGACIÓN
        // =========================
        public ProfesorEntity Profesor { get; set; } = null!;
        public ParaleloEntity Paralelo { get; set; } = null!;
        public MateriaEntity Materia { get; set; } = null!;
        public ICollection<ClaseHorarioEntity> ClasesHorario { get; set; } = new List<ClaseHorarioEntity>();
        public ICollection<ActividadEntity> Actividades { get; set; } = new List<ActividadEntity>();
    }
}
