using Presentech.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presentech.DataAccess.Configurations
{
    public class ActividadConfiguration : IEntityTypeConfiguration<ActividadEntity>
    {
        public void Configure(EntityTypeBuilder<ActividadEntity> builder)
        {
            // =========================
            // TABLA
            // =========================
            builder.ToTable("actividades");

            // =========================
            // CLAVE PRIMARIA
            // =========================
            builder.HasKey(a => a.id_actividad)
                   .HasName("PK_ACTIVIDADES");

            builder.Property(a => a.id_actividad)
                   .ValueGeneratedOnAdd();

            // =========================
            // DATOS DE LA ACTIVIDAD
            // =========================
            builder.Property(a => a.nombre)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.tipo)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(a => a.fecha);

            builder.Property(a => a.peso)
                   .IsRequired()
                   .HasColumnType("decimal(5,2)");

            // =========================
            // ESTADO / CICLO DE VIDA
            // =========================
            builder.Property(a => a.activo)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(a => a.created_at)
                   .IsRequired();

            // =========================
            // ÍNDICES
            // =========================
            builder.HasIndex(a => a.id_clase)
                   .HasDatabaseName("IDX_ACTIVIDADES_CLASE");

            // =========================
            // RELACIONES
            // =========================
            builder.HasOne(a => a.Clase)
                   .WithMany(c => c.Actividades)
                   .HasForeignKey(a => a.id_clase)
                   .HasConstraintName("FK_ACTIVIDAD_CLASE");
        }
    }
}
