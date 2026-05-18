using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IHashingService _hashingService;
    private readonly ITokenService _tokenService;
    private readonly IAuditService _auditService;

    public AuthService(
        AppDbContext context,
        IHashingService hashingService,
        ITokenService tokenService,
        IAuditService auditService)
    {
        _context = context;
        _hashingService = hashingService;
        _tokenService = tokenService;
        _auditService = auditService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .Include(x => x.AuthCredential)
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null || user.AuthCredential == null)
        {
            await _auditService.LogAsync(
                AuditEventType.LoginFailed,
                entityType: "User",
                metadataJson: $"{{\"email\":\"{request.Email}\",\"reason\":\"User not found\"}}");

            return null;
        }

        var passwordValid = _hashingService.Verify(
            request.Password,
            user.AuthCredential.PasswordHash);

        if (!passwordValid)
        {
            await _auditService.LogAsync(
                AuditEventType.LoginFailed,
                entityType: "User",
                entityId: user.Id,
                userId: user.Id,
                metadataJson: "{\"reason\":\"Invalid password\"}");

            return null;
        }

        var normalPinValid = _hashingService.Verify(
            request.Pin,
            user.AuthCredential.NormalPinHash);

        var duressPinValid = _hashingService.Verify(
            request.Pin,
            user.AuthCredential.DuressPinHash);

        if (!normalPinValid && !duressPinValid)
        {
            await _auditService.LogAsync(
                AuditEventType.LoginFailed,
                entityType: "User",
                entityId: user.Id,
                userId: user.Id,
                metadataJson: "{\"reason\":\"Invalid PIN\"}");

            return null;
        }

        var sessionMode = duressPinValid ? SessionMode.Duress : SessionMode.Normal;

        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            BankSessionId = $"SESS-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..32],
            Mode = sessionMode,
            Status = SessionStatus.Active,
            IpAddress = request.IpAddress,
            DeviceInfo = request.DeviceInfo,
            StartedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _context.UserSessions.AddAsync(session);

        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            var locationEvent = new LocationEvent
            {
                Id = Guid.NewGuid(),
                UserSessionId = session.Id,
                Latitude = request.Latitude.Value,
                Longitude = request.Longitude.Value,
                AccuracyMeters = request.AccuracyMeters ?? 0,
                LocationSource = LocationSource.Gps,
                CapturedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _context.LocationEvents.AddAsync(locationEvent);
        }

        if (duressPinValid)
        {
            var alert = new Alert
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                UserSessionId = session.Id,
                Type = AlertType.DuressLogin,
                Severity = RiskLevel.High,
                Status = AlertStatus.Open,
                Description = "User logged in using duress PIN.",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Alerts.AddAsync(alert);

            var riskEvaluation = new RiskEvaluation
            {
                Id = Guid.NewGuid(),
                UserSessionId = session.Id,
                Score = 0.95m,
                RiskLevel = RiskLevel.High,
                ReasonsJson = "{\"reason\":\"Duress PIN matched\"}",
                CreatedAt = DateTime.UtcNow
            };

            await _context.RiskEvaluations.AddAsync(riskEvaluation);

            var notificationAttempt = new NotificationAttempt
            {
                Id = Guid.NewGuid(),
                AlertId = alert.Id,
                Channel = NotificationChannel.Webhook,
                Destination = "Fraud team webhook",
                Status = NotificationStatus.Pending,
                AttemptedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _context.NotificationAttempts.AddAsync(notificationAttempt);
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            duressPinValid ? AuditEventType.DuressPinMatched : AuditEventType.NormalPinMatched,
            entityType: "UserSession",
            entityId: session.Id,
            userId: user.Id,
            userSessionId: session.Id);

        await _auditService.LogAsync(
            AuditEventType.SessionCreated,
            entityType: "UserSession",
            entityId: session.Id,
            userId: user.Id,
            userSessionId: session.Id);

        var token = _tokenService.CreateToken(user, session);

        return new LoginResponseDto
        {
            UserId = user.Id,
            UserSessionId = session.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            SessionMode = session.Mode.ToString(),
            IsDuress = session.Mode == SessionMode.Duress
        };
    }
}