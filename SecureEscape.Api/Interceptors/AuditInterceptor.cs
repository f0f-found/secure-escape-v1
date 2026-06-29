using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Interceptors
{
    public class AuditInterceptor : SaveChangesInterceptor
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly ICurrentAdminService _currentAdminService;

        public AuditInterceptor(
            ICurrentUserService currentUserService,
            ICurrentAdminService currentAdminService)
        {
            _currentUserService = currentUserService;
            _currentAdminService = currentAdminService;
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var context = eventData.Context;

            if (context == null)
                return base.SavingChangesAsync(eventData, result, cancellationToken);

            CurrentUserContext? currentUser = null;
            try { currentUser = _currentUserService.GetCurrentUser(); }
            catch { /* no authenticated user — system action */ }

            CurrentAdminContext? currentAdmin = null;
            try { currentAdmin = _currentAdminService.GetCurrentAdmin(); }
            catch { /* not an admin action */ }

            var auditLogs = new List<AuditLog>();

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog)
                    continue;

                if (entry.Entity is RiskEvaluation ||
                    entry.Entity is NotificationAttempt ||
                    entry.Entity is LocationEvent)
                {
                    continue;
                }  

                if (entry.State == EntityState.Added)
                {
                    auditLogs.Add(new AuditLog
                    {
                        Id = Guid.NewGuid(),
                        EventType = AuditEventType.EntityCreated,
                        EntityType = entry.Entity.GetType().Name,
                        EntityId = GetEntityId(entry.Entity),
                        UserId = currentUser?.UserId,
                        UserSessionId = currentUser?.UserSessionId,
                        AdminUserId = currentAdmin?.AdminUserId,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (entry.State == EntityState.Modified)
                {
                    auditLogs.Add(new AuditLog
                    {
                        Id = Guid.NewGuid(),
                        EventType = AuditEventType.EntityCreated,
                        EntityType = entry.Entity.GetType().Name,
                        EntityId = GetEntityId(entry.Entity),
                        UserId = currentUser?.UserId,
                        UserSessionId = currentUser?.UserSessionId,
                        AdminUserId = currentAdmin?.AdminUserId,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (entry.State == EntityState.Deleted)
                {
                    auditLogs.Add(new AuditLog
                    {
                        Id = Guid.NewGuid(),
                        EventType = AuditEventType.EntityCreated,
                        EntityType = entry.Entity.GetType().Name,
                        EntityId = GetEntityId(entry.Entity),
                        UserId = currentUser?.UserId,
                        UserSessionId = currentUser?.UserSessionId,
                        AdminUserId = currentAdmin?.AdminUserId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            context.Set<AuditLog>().AddRange(auditLogs);

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private static Guid? GetEntityId(object entity)
        {
            var value = entity.GetType()
                    .GetProperty("Id")?
                    .GetValue(entity);

            return value is Guid id ? id : null;
        }
    }


}