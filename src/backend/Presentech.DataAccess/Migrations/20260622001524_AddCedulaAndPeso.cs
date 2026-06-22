using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Presentech.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCedulaAndPeso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cedula",
                table: "estudiantes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE estudiantes SET \"Cedula\" = gen_random_uuid()::text;");

            migrationBuilder.AddColumn<decimal>(
                name: "peso",
                table: "actividades",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IDX_ESTUDIANTES_CEDULA",
                table: "estudiantes",
                column: "Cedula",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IDX_ESTUDIANTES_CEDULA",
                table: "estudiantes");

            migrationBuilder.DropColumn(
                name: "Cedula",
                table: "estudiantes");

            migrationBuilder.DropColumn(
                name: "peso",
                table: "actividades");
        }
    }
}
