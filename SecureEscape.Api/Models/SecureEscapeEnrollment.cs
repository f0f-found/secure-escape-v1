using SecureEscape.Api.Enums;

namespace SecureEscape.Api.Models
{
    public class SecureEscapeEnrollment
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public SecureEscapeEnrollmentStatus Status { get; set; }
            = SecureEscapeEnrollmentStatus.SetupInProgress;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ActivatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }
    }
}