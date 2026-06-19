using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Presentech.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AgregarModuloCalificaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "actividades",
                columns: table => new
                {
                    id_actividad = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_clase = table.Column<int>(type: "integer", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ACTIVIDADES", x => x.id_actividad);
                    table.ForeignKey(
                        name: "FK_ACTIVIDAD_CLASE",
                        column: x => x.id_clase,
                        principalTable: "clases",
                        principalColumn: "id_clase",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "calificaciones",
                columns: table => new
                {
                    id_calificacion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_actividad = table.Column<int>(type: "integer", nullable: false),
                    id_estudiante = table.Column<int>(type: "integer", nullable: false),
                    nota = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CALIFICACIONES", x => x.id_calificacion);
                    table.ForeignKey(
                        name: "FK_CALIFICACION_ACTIVIDAD",
                        column: x => x.id_actividad,
                        principalTable: "actividades",
                        principalColumn: "id_actividad",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CALIFICACION_ESTUDIANTE",
                        column: x => x.id_estudiante,
                        principalTable: "estudiantes",
                        principalColumn: "id_estudiante",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IDX_ACTIVIDADES_CLASE",
                table: "actividades",
                column: "id_clase");

            migrationBuilder.CreateIndex(
                name: "IDX_CALIFICACIONES_ACTIVIDAD_ESTUDIANTE",
                table: "calificaciones",
                columns: new[] { "id_actividad", "id_estudiante" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IDX_CALIFICACIONES_ESTUDIANTE",
                table: "calificaciones",
                column: "id_estudiante");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "calificaciones");

            migrationBuilder.DropTable(
                name: "actividades");
        }
    }
}
