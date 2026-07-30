using SecureEscape.Api.DTOs;

namespace SecureEscape.Api.Interfaces;

public interface ICurrentUserService
{
    CurrentUserContext GetCurrentUser();
}