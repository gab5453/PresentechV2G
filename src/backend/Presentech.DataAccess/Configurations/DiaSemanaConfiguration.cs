using Presentech.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Presentech.DataAccess.Configurations
{
    public class DiaSemanaConfiguration : IEntityTypeConfiguration<DiaSemanaEntity>
    {
        public void Configure(EntityTypeBuilder<DiaSemanaEntity> builder)
        {
            // =========================
            // TABLA
            // =========================
            builder.ToTable("dias_semana");

            // =========================
            // CLAVE PRIMARIA
            // =========================
            builder.HasKey(d => d.id_dia)
                   .HasName("PK_DIAS_SEMANA");

            builder.Property(d => d.id_dia)
                   .ValueGeneratedOnAdd();

            // =========================
            // DATOS DEL DÍA
            // =========================
            builder.Property(d => d.nombre)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(d => d.orden)
                   .IsRequired();

            // =========================
            // ÍNDICES / UNIQUE
            // =========================
            builder.HasIndex(d => d.orden)
                   .IsUnique()
                   .HasDatabaseName("UQ_DIAS_SEMANA_ORDEN");

            // =========================
            // DATA SEMILLA
            // =========================
            builder.HasData(
                new DiaSemanaEntity { id_dia = 1, nombre = "Lunes", orden = 1 },
                new DiaSemanaEntity { id_dia = 2, nombre = "Martes", orden = 2 },
                new DiaSemanaEntity { id_dia = 3, nombre = "Miércoles", orden = 3 },
                new DiaSemanaEntity { id_dia = 4, nombre = "Jueves", orden = 4 },
                new DiaSemanaEntity { id_dia = 5, nombre = "Viernes", orden = 5 },
                new DiaSemanaEntity { id_dia = 6, nombre = "Sábado", orden = 6 },
                new DiaSemanaEntity { id_dia = 7, nombre = "Domingo", orden = 7 }
            );
        }
    }
}
