using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Presentech.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedDiasSemana : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "dias_semana",
                columns: new[] { "id_dia", "nombre", "orden" },
                values: new object[,]
                {
                    { 1, "Lunes", 1 },
                    { 2, "Martes", 2 },
                    { 3, "Miércoles", 3 },
                    { 4, "Jueves", 4 },
                    { 5, "Viernes", 5 },
                    { 6, "Sábado", 6 },
                    { 7, "Domingo", 7 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "dias_semana",
                keyColumn: "id_dia",
                keyValue: 7);
        }
    }
}
