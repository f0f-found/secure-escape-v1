using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class RestructureAlertActionsToSessionLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertActions_Alerts_AlertId",
                table: "AlertActions");

            migrationBuilder.RenameColumn(
                name: "AlertId",
                table: "AlertActions",
                newName: "UserSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_AlertActions_AlertId",
                table: "AlertActions",
                newName: "IX_AlertActions_UserSessionId");

            migrationBuilder.AddColumn<DateTime>(
                name: "CaseResolvedAt",
                table: "UserSessions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CaseStatus",
                table: "UserSessions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_AlertActions_UserSessions_UserSessionId",
                table: "AlertActions",
                column: "UserSessionId",
                principalTable: "UserSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertActions_UserSessions_UserSessionId",
                table: "AlertActions");

            migrationBuilder.DropColumn(
                name: "CaseResolvedAt",
                table: "UserSessions");

            migrationBuilder.DropColumn(
                name: "CaseStatus",
                table: "UserSessions");

            migrationBuilder.RenameColumn(
                name: "UserSessionId",
                table: "AlertActions",
                newName: "AlertId");

            migrationBuilder.RenameIndex(
                name: "IX_AlertActions_UserSessionId",
                table: "AlertActions",
                newName: "IX_AlertActions_AlertId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlertActions_Alerts_AlertId",
                table: "AlertActions",
                column: "AlertId",
                principalTable: "Alerts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
