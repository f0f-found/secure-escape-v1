using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddModeSpecificDuressSpendingLimits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OriginalSpendingLimit",
                table: "DuressBudgets",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PendingThresholdRate",
                table: "DuressBudgets",
                type: "decimal(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingSpendingLimit",
                table: "DuressBudgets",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql("UPDATE DuressBudgets SET OriginalSpendingLimit = OriginalBalance, RemainingSpendingLimit = RemainingBalance, PendingThresholdRate = 0.5000 WHERE PendingThresholdRate = 0.0000");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OriginalSpendingLimit",
                table: "DuressBudgets");

            migrationBuilder.DropColumn(
                name: "PendingThresholdRate",
                table: "DuressBudgets");

            migrationBuilder.DropColumn(
                name: "RemainingSpendingLimit",
                table: "DuressBudgets");
        }
    }
}
