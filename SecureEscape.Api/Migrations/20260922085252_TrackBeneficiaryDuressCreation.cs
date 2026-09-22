using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class TrackBeneficiaryDuressCreation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CreatedUnderDuress",
                table: "Beneficiaries",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            // Recover provenance only where a creation-time audit identifies a
            // duress session. Do not infer it from LastPaidAt or later payments.
            migrationBuilder.Sql("""
                UPDATE Beneficiaries b
                INNER JOIN AuditLogs a ON a.EntityId = b.Id
                    AND a.EntityType = 'Beneficiary' AND a.EventType = 'EntityCreated'
                    AND a.CreatedAt >= b.CreatedAt
                    AND a.CreatedAt <= DATE_ADD(b.CreatedAt, INTERVAL 5 SECOND)
                INNER JOIN UserSessions s ON s.Id = a.UserSessionId
                    AND s.UserId = b.UserId AND s.Mode = 'Duress'
                SET b.CreatedUnderDuress = TRUE;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedUnderDuress",
                table: "Beneficiaries");
        }
    }
}
