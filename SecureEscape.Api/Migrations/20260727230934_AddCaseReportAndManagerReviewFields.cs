using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseReportAndManagerReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CaseStatus",
                table: "UserSessions",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "InvestigationSummary",
                table: "UserSessions",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ManagerReviewNotes",
                table: "UserSessions",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ManagerReviewStatus",
                table: "UserSessions",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "ManagerReviewedAt",
                table: "UserSessions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ManagerReviewedByAdminUserId",
                table: "UserSessions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolutionSubmittedAt",
                table: "UserSessions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResolutionSummary",
                table: "UserSessions",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "ResolvedByAdminUserId",
                table: "UserSessions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvestigationSummary",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ManagerReviewNotes",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ManagerReviewStatus",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ManagerReviewedAt",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ManagerReviewedByAdminUserId",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ResolutionSubmittedAt",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ResolutionSummary",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "ResolvedByAdminUserId",
                table: "UserSessions");

            migrationBuilder.AlterColumn<int>(
                name: "CaseStatus",
                table: "UserSessions",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
