using SecureEscape.Api.DTOs;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly ISecurityEventRepository _securityEventRepository;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        ISecurityEventRepository securityEventRepository)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _securityEventRepository = securityEventRepository;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return null;
        }

        if (user.PasswordHash != request.Password)
        {
            return null;
        }

        var isNormalPin = user.PinHash == request.Pin;
        var isDuressPin = user.DuressPinHash == request.Pin;

        if (!isNormalPin && !isDuressPin)
        {
            return null;
        }

        if (isDuressPin)
        {
            await _securityEventRepository.AddAsync(new SecurityEvent
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                EventType = "DURESS_LOGIN",
                Description = "User logged in using duress PIN.",
                CreatedAt = DateTime.UtcNow
            });
        }

        var token = _tokenService.CreateToken(user);

        return new LoginResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            IsUnderDuress = isDuressPin
        };
    }
}
