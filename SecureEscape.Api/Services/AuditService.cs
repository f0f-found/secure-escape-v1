using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
        AuditEventType eventType,
        string entityType,
        Guid? entityId = null,
        Guid? userId = null,
        Guid? userSessionId = null,
        Guid? adminUserId = null,
        string metadataJson = "")
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EventType = eventType,
            EntityType = entityType,
            EntityId = entityId,
            UserId = userId,
            UserSessionId = userSessionId,
            AdminUserId = adminUserId,
            MetadataJson = metadataJson,
            CreatedAt = DateTime.UtcNow
        };

        await _context.AuditLogs.AddAsync(auditLog);
        await _context.SaveChangesAsync();
    }
}