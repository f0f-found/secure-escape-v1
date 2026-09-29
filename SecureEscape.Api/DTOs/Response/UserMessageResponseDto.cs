namespace SecureEscape.Api.DTOs.Response
{
    public class UserMessageResponseDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string? ReferenceType { get; set; }

        public string? ReferenceId { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReadAt { get; set; }
    }
}