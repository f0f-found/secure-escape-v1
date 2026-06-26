using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Middleware;

public class ActiveSessionMiddleware
{
    private readonly RequestDelegate _next;

    public ActiveSessionMiddleware(RequestDelegate next)
    {
        _next = next;
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
            await RejectRequestAsync(httpContext);
            return;
        }

        var sessionIsActive = await dbContext.UserSessions
            .AsNoTracking()
            .AnyAsync(
                session =>
                    session.Id == sessionId &&
                    session.UserId == userId &&
                    session.Status == SessionStatus.Active,
                httpContext.RequestAborted);

        if (!sessionIsActive)
        {
            await RejectRequestAsync(httpContext);
            return;
        }

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