namespace SecureEscape.Api.Services;

public static class SessionPolicy
{
    public static readonly TimeSpan InactivityTimeout = TimeSpan.FromMinutes(10);
}
