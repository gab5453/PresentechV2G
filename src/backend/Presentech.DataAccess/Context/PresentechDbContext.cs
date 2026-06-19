using Presentech.DataAccess.Configurations;
using Presentech.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Presentech.DataAccess.Context
{
    public class PresentechDbContext : DbContext
    {
        public PresentechDbContext(DbContextOptions<PresentechDbContext> options)
            : base(options)
        {
        }

        // =========================
        // ENTIDADES DEL DOMINIO
        // =========================
        public DbSet<AdministradorEntity> Administradores => Set<AdministradorEntity>();
        public DbSet<ProfesorEntity> Profesores => Set<ProfesorEntity>();
        public DbSet<EstudianteEntity> Estudiantes => Set<EstudianteEntity>();
        public DbSet<ParaleloEntity> Paralelos => Set<ParaleloEntity>();
        public DbSet<ParaleloEstudianteEntity> ParaleloEstudiantes => Set<ParaleloEstudianteEntity>();
        public DbSet<DiaSemanaEntity> DiasSemana => Set<DiaSemanaEntity>();
        public DbSet<MateriaEntity> Materias => Set<MateriaEntity>();
        public DbSet<ClaseEntity> Clases => Set<ClaseEntity>();
        public DbSet<ClaseHorarioEntity> ClasesHorario => Set<ClaseHorarioEntity>();
        public DbSet<RegistroAsistenciaEntity> RegistrosAsistencia => Set<RegistroAsistenciaEntity>();
        public DbSet<AsistenciaEntity> Asistencias => Set<AsistenciaEntity>();
        public DbSet<OpinionRecomendacionEntity> OpinionesRecomendaciones => Set<OpinionRecomendacionEntity>();
        public DbSet<ActividadEntity> Actividades => Set<ActividadEntity>();
        public DbSet<CalificacionEntity> Calificaciones => Set<CalificacionEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new AdministradorConfiguration());
            modelBuilder.ApplyConfiguration(new ProfesorConfiguration());
            modelBuilder.ApplyConfiguration(new EstudianteConfiguration());
            modelBuilder.ApplyConfiguration(new ParaleloConfiguration());
            modelBuilder.ApplyConfiguration(new ParaleloEstudianteConfiguration());
            modelBuilder.ApplyConfiguration(new DiaSemanaConfiguration());
            modelBuilder.ApplyConfiguration(new MateriaConfiguration());
            modelBuilder.ApplyConfiguration(new ClaseConfiguration());
            modelBuilder.ApplyConfiguration(new ClaseHorarioConfiguration());
            modelBuilder.ApplyConfiguration(new RegistroAsistenciaConfiguration());
            modelBuilder.ApplyConfiguration(new AsistenciaConfiguration());
            modelBuilder.ApplyConfiguration(new OpinionRecomendacionConfiguration());
            modelBuilder.ApplyConfiguration(new ActividadConfiguration());
            modelBuilder.ApplyConfiguration(new CalificacionConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}
