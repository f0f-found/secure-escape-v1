using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherNumberToBankTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VoucherCode",
                table: "BankTransactions",
                newName: "VoucherPin");

            migrationBuilder.AddColumn<string>(
                name: "VoucherNumber",
                table: "BankTransactions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VoucherNumber",
                table: "BankTransactions");

            migrationBuilder.RenameColumn(
                name: "VoucherPin",
                table: "BankTransactions",
                newName: "VoucherCode");
        }
    }
}
