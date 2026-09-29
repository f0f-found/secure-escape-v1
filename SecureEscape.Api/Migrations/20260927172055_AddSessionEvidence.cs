using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionEvidence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SessionEvidence",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserSessionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    BankTransactionId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    EvidenceType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StoragePath = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContentType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionEvidence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionEvidence_BankTransactions_BankTransactionId",
                        column: x => x.BankTransactionId,
                        principalTable: "BankTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_SessionEvidence_UserSessions_UserSessionId",
                        column: x => x.UserSessionId,
                        principalTable: "UserSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_SessionEvidence_BankTransactionId",
                table: "SessionEvidence",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionEvidence_UserSessionId",
                table: "SessionEvidence",
                column: "UserSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionEvidence");
        }
    }
}
