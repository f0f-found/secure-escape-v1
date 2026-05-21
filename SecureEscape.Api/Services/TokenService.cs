using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(User user, UserSession session)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = jwtSettings["SigningKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expiresInHours = Convert.ToDouble(jwtSettings["TokenExpirationInHours"]);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("bankIntegrationId", user.BankIntegrationId.ToString()),
            new Claim("userSessionId", session.Id.ToString()),
            new Claim("sessionMode", session.Mode.ToString())
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresInHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string CreateAdminToken(AdminUser adminUser)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = jwtSettings["SigningKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expiresInHours = Convert.ToDouble(jwtSettings["TokenExpirationInHours"]);

        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
        new Claim(ClaimTypes.Name, adminUser.FullName),
        new Claim(ClaimTypes.Email, adminUser.Email),
        new Claim("bankIntegrationId", adminUser.BankIntegrationId.ToString()),
        new Claim("adminRole", adminUser.AdminRole.ToString()),
        new Claim(ClaimTypes.Role, adminUser.AdminRole.ToString())
    };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiresInHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}