using SecureEscape.Api.DTOs;

namespace SecureEscape.Api.Interfaces;

public interface ICurrentAdminService
{
    CurrentAdminContext GetCurrentAdmin();
}