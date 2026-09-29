using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureEscape.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMessageDeduplicationIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserMessages_UserId_DeduplicationKey",
                table: "UserMessages",
                columns: new[] { "UserId", "DeduplicationKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserMessages_UserId_DeduplicationKey",
                table: "UserMessages");
        }
    }
}