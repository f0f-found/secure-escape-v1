using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(
        AuditEventType eventType,
        string entityType,
        Guid? entityId = null,
        Guid? userId = null,
        Guid? userSessionId = null,
        Guid? adminUserId = null,
        string metadataJson = "");
    }
}