using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Middleware;
using SecureEscape.Api.Models;
using Xunit;

namespace SecureEscape.Api.Tests;

public class ActiveSessionMiddlewareTests
{
    [Theory]
    [InlineData(2, SessionStatus.Active, true)]
    [InlineData(9, SessionStatus.Active, true)]
    [InlineData(11, SessionStatus.Active, false)]
    [InlineData(1, SessionStatus.Terminated, false)]
    [InlineData(1, SessionStatus.Expired, false)]
    public async Task ChecksInactivityAndSessionStatus(
        int idleMinutes, SessionStatus status, bool accepted)
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var previousActivity = DateTime.UtcNow.AddMinutes(-idleMinutes);
        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            BankSessionId = "test-session",
            Status = status,
            LastActivityAt = previousActivity,
        };
        db.UserSessions.Add(session);
        await db.SaveChangesAsync();
        var http = new DefaultHttpContext();
        http.Response.Body = new MemoryStream();
        http.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, session.UserId.ToString()),
            new Claim("userSessionId", session.Id.ToString()),
        }, "test"));
        var calledNext = false;
        var middleware = new ActiveSessionMiddleware(_ =>
        {
            calledNext = true;
            return Task.CompletedTask;
        }, NullLogger<ActiveSessionMiddleware>.Instance);

        await middleware.InvokeAsync(http, db);

        calledNext.Should().Be(accepted);
        if (accepted)
        {
            session.Status.Should().Be(SessionStatus.Active);
            session.LastActivityAt.Should().BeAfter(previousActivity);
        }
        else
        {
            http.Response.StatusCode.Should().Be(401);
            session.Status.Should().Be(status == SessionStatus.Active
                ? SessionStatus.Expired : status);
            session.LastActivityAt.Should().Be(previousActivity);
        }
    }
}
