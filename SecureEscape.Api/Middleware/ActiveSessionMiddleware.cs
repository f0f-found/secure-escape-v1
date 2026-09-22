using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Services;

namespace SecureEscape.Api.Middleware;

public class ActiveSessionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ActiveSessionMiddleware> _logger;

    public ActiveSessionMiddleware(RequestDelegate next, ILogger<ActiveSessionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext httpContext,
        AppDbContext dbContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            await _next(httpContext);
            return;
        }

        var sessionClaim = httpContext.User.FindFirst("userSessionId")?.Value;

        // Admin tokens do not use customer sessions.
        if (string.IsNullOrWhiteSpace(sessionClaim))
        {
            await _next(httpContext);
            return;
        }

        var userClaim = httpContext.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(sessionClaim, out var sessionId) ||
            !Guid.TryParse(userClaim, out var userId))
        {
            _logger.LogWarning("Session rejected: invalid session or user claims.");
            await RejectRequestAsync(httpContext);
            return;
        }

        var session = await dbContext.UserSessions
            .FirstOrDefaultAsync(
            session =>
            session.Id == sessionId &&
            session.UserId == userId,
            httpContext.RequestAborted);

        if (session == null || session.Status != SessionStatus.Active)
        {
            _logger.LogInformation("Session {SessionId} rejected: status {Status}, last activity {LastActivityAt}, ended {EndedAt}.",
                sessionId, session?.Status, session?.LastActivityAt, session?.EndedAt);
            await RejectRequestAsync(httpContext);
            return;
        }

        var now = DateTime.UtcNow;

        if (now - session.LastActivityAt >= SessionPolicy.InactivityTimeout)
        {
            _logger.LogInformation("Session {SessionId} expired after {IdleSeconds} seconds without activity.",
                sessionId, (now - session.LastActivityAt).TotalSeconds);
            session.Status = SessionStatus.Expired;
            session.EndedAt = now;
            session.UpdatedAt = now;

            await dbContext.SaveChangesAsync(httpContext.RequestAborted);
            await RejectRequestAsync(httpContext);
            return;
        }

        session.LastActivityAt = now;
        session.UpdatedAt = now;

        await dbContext.SaveChangesAsync(httpContext.RequestAborted);

        await _next(httpContext);
    }

    private static async Task RejectRequestAsync(HttpContext httpContext)
    {
        httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;

        await httpContext.Response.WriteAsJsonAsync(new
        {
            message = "Your session is no longer active. Please sign in again."
        });
    }
}
