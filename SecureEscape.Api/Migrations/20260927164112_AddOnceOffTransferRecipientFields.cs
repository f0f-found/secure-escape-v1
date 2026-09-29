using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOnceOffTransferRecipientFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RecipientAccountNumber",
                table: "BankTransactions",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecipientAccountType",
                table: "BankTransactions",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecipientBank",
                table: "BankTransactions",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecipientBranchCode",
                table: "BankTransactions",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecipientName",
                table: "BankTransactions",
                type: "varchar(150)",
                maxLength: 150,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecipientAccountNumber",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "RecipientAccountType",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "RecipientBank",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "RecipientBranchCode",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "RecipientName",
                table: "BankTransactions");
        }
    }
}
