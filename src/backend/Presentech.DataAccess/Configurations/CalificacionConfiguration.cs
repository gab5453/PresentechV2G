using Presentech.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presentech.DataAccess.Configurations
{
    public class CalificacionConfiguration : IEntityTypeConfiguration<CalificacionEntity>
    {
        public void Configure(EntityTypeBuilder<CalificacionEntity> builder)
        {
            // =========================
            // TABLA
            // =========================
            builder.ToTable("calificaciones");

            // =========================
            // CLAVE PRIMARIA
            // =========================
            builder.HasKey(c => c.id_calificacion)
                   .HasName("PK_CALIFICACIONES");

            builder.Property(c => c.id_calificacion)
                   .ValueGeneratedOnAdd();

            // =========================
            // DATOS DE LA CALIFICACIÓN
            // =========================
            builder.Property(c => c.nota)
                   .IsRequired()
                   .HasColumnType("decimal(5,2)"); // Permite notas como 10.00, 7.50, etc.

            // =========================
            // ESTADO / CICLO DE VIDA
            // =========================
            builder.Property(c => c.fecha_registro)
                   .IsRequired();

            // =========================
            // ÍNDICES
            // =========================
            builder.HasIndex(c => new { c.id_actividad, c.id_estudiante })
                   .IsUnique()
                   .HasDatabaseName("IDX_CALIFICACIONES_ACTIVIDAD_ESTUDIANTE");

            builder.HasIndex(c => c.id_estudiante)
                   .HasDatabaseName("IDX_CALIFICACIONES_ESTUDIANTE");

            // =========================
            // RELACIONES
            // =========================
            builder.HasOne(c => c.Actividad)
                   .WithMany(a => a.Calificaciones)
                   .HasForeignKey(c => c.id_actividad)
                   .HasConstraintName("FK_CALIFICACION_ACTIVIDAD")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Estudiante)
                   .WithMany(e => e.Calificaciones)
                   .HasForeignKey(c => c.id_estudiante)
                   .HasConstraintName("FK_CALIFICACION_ESTUDIANTE")
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
