using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherAndFraudFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FraudReportReference",
                table: "BankTransactions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "FraudReported",
                table: "BankTransactions",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FraudReportedAt",
                table: "BankTransactions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VoucherCode",
                table: "BankTransactions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "VoucherExpiresAt",
                table: "BankTransactions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VoucherRedeemed",
                table: "BankTransactions",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FraudReportReference",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "FraudReported",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "FraudReportedAt",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "VoucherCode",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "VoucherExpiresAt",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "VoucherRedeemed",
                table: "BankTransactions");
        }
    }
}
