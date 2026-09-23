using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using MySqlConnector;

using var config = JsonDocument.Parse(await File.ReadAllTextAsync("SecureEscape.Api/appsettings.json"));
var connection = Environment.GetEnvironmentVariable("SECUREESCAPE_MIGRATION_CONNECTION")
    ?? config.RootElement.GetProperty("ConnectionStrings").GetProperty("default").GetString()
    ?? throw new InvalidOperationException("Database connection is missing.");
var settings = new MySqlConnectionStringBuilder(connection) { ConnectionTimeout = 10, DefaultCommandTimeout = 60 };
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseMySql(settings.ConnectionString, new MySqlServerVersion(new Version(8, 0, 21))).Options;
await using var db = new AppDbContext(options);
var allowed = new HashSet<string>
{
    "20260921204957_AddDuressSessionBudgets",
    "20260922085252_TrackBeneficiaryDuressCreation",
    "20260923103236_AddModeSpecificDuressSpendingLimits",
};
try
{
    var backupIndex = Array.IndexOf(args, "--backup");
    if (backupIndex >= 0)
    {
        if (backupIndex + 1 >= args.Length) throw new ArgumentException("A backup output path is required.");
        await DatabaseBackup.WriteAsync(settings.ConnectionString, args[backupIndex + 1]);
        return;
    }
    var pending = (await db.Database.GetPendingMigrationsAsync()).ToArray();
    Console.WriteLine(JsonSerializer.Serialize(new { database = settings.Database, pending }));
    if (pending.Any(x => !allowed.Contains(x)))
        throw new InvalidOperationException("Other migrations are pending. Refusing to modify the database.");
    if (!args.Contains("--apply")) return;
    await db.Database.MigrateAsync();
    var applied = (await db.Database.GetAppliedMigrationsAsync()).Where(allowed.Contains).ToArray();
    Console.WriteLine(JsonSerializer.Serialize(new { applied, remaining = (await db.Database.GetPendingMigrationsAsync()).ToArray() }));
    // Read the new table/column to verify the migration produced usable schema.
    await db.DuressBudgets.AsNoTracking().Take(1).ToListAsync();
    await db.Beneficiaries.AsNoTracking().Select(x => x.CreatedUnderDuress).Take(1).ToListAsync();
    Console.WriteLine("Tier schema verified.");
}
catch (MySqlException ex)
{
    Console.Error.WriteLine($"Database operation failed (MySQL {ex.Number}); credentials have not been printed.");
    Environment.ExitCode = 1;
}
