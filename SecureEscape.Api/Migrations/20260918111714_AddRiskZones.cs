using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRiskZones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RiskZones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RiskLevel = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Latitude = table.Column<decimal>(type: "decimal(10,7)", nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(10,7)", nullable: false),
                    RadiusMeters = table.Column<int>(type: "int", nullable: false),
                    RiskScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IncidentCount = table.Column<int>(type: "int", nullable: false),
                    DuressEventCount = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskZones", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_RiskZones_IsActive",
                table: "RiskZones",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_RiskZones_RiskLevel",
                table: "RiskZones",
                column: "RiskLevel");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RiskZones");
        }
    }
}
