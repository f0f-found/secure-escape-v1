using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class SecureEscapeService : ISecureEscapeService
{
    private readonly IDecoyProfileRepository _decoyProfileRepository;
    private readonly IUserRepository _userRepository;
    private readonly IHashingService _hashingService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuditService _auditService;
    private readonly IUnitOfWork _unitOfWork;

    public SecureEscapeService(
        IDecoyProfileRepository decoyProfileRepository,
        IUserRepository userRepository,
        IHashingService hashingService,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        IAuditService auditService)
    {
        _decoyProfileRepository = decoyProfileRepository;
        _userRepository = userRepository;
        _hashingService = hashingService;
        _currentUserService = currentUserService;
        _auditService = auditService;
        _unitOfWork = unitOfWork;
    }

    public async Task<DecoyProfileResponseDto?> GetActiveDecoyProfileAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var decoyProfile = await _decoyProfileRepository.GetActiveByUserIdAsync(currentUser.UserId);

        return decoyProfile == null
            ? null
            : MapToResponse(decoyProfile);
    }

    public async Task<DecoyProfileResponseDto> UpsertDecoyProfileAsync(UpsertDecoyProfileRequestDto request)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var decoyProfile = await _decoyProfileRepository.GetActiveByUserIdAsync(currentUser.UserId);

        if (decoyProfile == null)
        {
            decoyProfile = new DecoyProfile
            {
                Id = Guid.NewGuid(),
                UserId = currentUser.UserId,
                ProfileType = request.ProfileType,
                DisplayBalance = request.DisplayBalance,
                EmergencyBudget = request.EmergencyBudget,
                Tier1Limit = request.Tier1Limit,
                Tier2Limit = request.Tier2Limit,
                Tier2DelayHours = request.Tier2DelayHours,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _decoyProfileRepository.AddAsync(decoyProfile);
        }
        else
        {
            decoyProfile.ProfileType = request.ProfileType;
            decoyProfile.DisplayBalance = request.DisplayBalance;
            decoyProfile.EmergencyBudget = request.EmergencyBudget;
            decoyProfile.Tier1Limit = request.Tier1Limit;
            decoyProfile.Tier2Limit = request.Tier2Limit;
            decoyProfile.Tier2DelayHours = request.Tier2DelayHours;
            decoyProfile.IsActive = true;
            decoyProfile.UpdatedAt = DateTime.UtcNow;

            await _decoyProfileRepository.UpdateAsync(decoyProfile);
        }

        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.DecoyProfileUpdated,
            entityType: "DecoyProfile",
            entityId: decoyProfile.Id,
            userId: currentUser.UserId,
            userSessionId: currentUser.UserSessionId);

        return MapToResponse(decoyProfile);
    }

    public async Task<bool> SetDuressPinAsync(SetDuressPinRequestDto request)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        var user = await _userRepository.GetByIdWithCredentialsAsync(currentUser.UserId);

        if (user == null || user.AuthCredential == null)
        {
            return false;
        }

        var passwordValid = _hashingService.Verify(
            request.CurrentPassword,
            user.AuthCredential.PasswordHash);

        if (!passwordValid)
        {
            return false;
        }

        user.AuthCredential.DuressPinHash = _hashingService.Hash(request.DuressPin);
        user.AuthCredential.DuressPinUpdatedAt = DateTime.UtcNow;
        user.AuthCredential.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        await _unitOfWork.SaveChangesAsync();

        await _auditService.LogAsync(
            AuditEventType.DuressPinUpdated,
            entityType: "AuthCredential",
            entityId: user.AuthCredential.Id,
            userId: currentUser.UserId,
            userSessionId: currentUser.UserSessionId,
            metadataJson: "{\"action\":\"Duress PIN updated\"}");

        return true;
    }

    private static DecoyProfileResponseDto MapToResponse(DecoyProfile decoyProfile)
    {
        return new DecoyProfileResponseDto
        {
            Id = decoyProfile.Id,
            UserId = decoyProfile.UserId,
            ProfileType = decoyProfile.ProfileType,
            DisplayBalance = decoyProfile.DisplayBalance,
            EmergencyBudget = decoyProfile.EmergencyBudget,
            Tier1Limit = decoyProfile.Tier1Limit,
            Tier2Limit = decoyProfile.Tier2Limit,
            Tier2DelayHours = decoyProfile.Tier2DelayHours,
            IsActive = decoyProfile.IsActive,
            CreatedAt = decoyProfile.CreatedAt,
            UpdatedAt = decoyProfile.UpdatedAt
        };
    }
}