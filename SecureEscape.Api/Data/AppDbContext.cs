using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<SecurityEvent> SecurityEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    FullName = "Test User",
                    Email = "test@secureescape.com",
                    PasswordHash = "Password123",
                    PinHash = "1234",
                    DuressPinHash = "0000",
                    IsUnderDuress = false,
                    CreatedAt = new DateTime(2026, 5, 2, 0, 0, 0, DateTimeKind.Utc)
                }
            );

        }
    }
}
