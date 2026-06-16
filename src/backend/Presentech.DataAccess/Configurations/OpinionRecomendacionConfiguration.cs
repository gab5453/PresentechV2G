using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Configurations
{
    public class OpinionRecomendacionConfiguration : IEntityTypeConfiguration<OpinionRecomendacionEntity>
    {
        public void Configure(EntityTypeBuilder<OpinionRecomendacionEntity> builder)
        {
            builder.ToTable("opiniones_recomendaciones");

            builder.HasKey(o => o.id_opinion)
                .HasName("PK_OPINIONES_RECOMENDACIONES");

            builder.Property(o => o.id_opinion)
                .ValueGeneratedOnAdd();

            builder.Property(o => o.utilizaria_siguiente_anio)
                .IsRequired();

            builder.Property(o => o.calificacion_usabilidad)
                .IsRequired();

            builder.Property(o => o.aspecto_mas_util)
                .IsRequired();

            builder.Property(o => o.aspectos_por_mejorar)
                .IsRequired();

            builder.Property(o => o.created_at)
                .IsRequired()
                .HasColumnType("timestamp")
                .HasDefaultValueSql("NOW()");

            builder.HasIndex(o => o.id_profesor)
                .HasDatabaseName("IDX_OPINIONES_PROFESOR");

            builder.ToTable(t => t.HasCheckConstraint(
                "CHK_OPINIONES_CALIFICACION_USABILIDAD",
                "calificacion_usabilidad BETWEEN 1 AND 5"));

            builder.HasOne(o => o.Profesor)
                .WithMany(p => p.OpinionesRecomendaciones)
                .HasForeignKey(o => o.id_profesor)
                .HasConstraintName("FK_OPINIONES_PROFESOR");
        }
    }
}
