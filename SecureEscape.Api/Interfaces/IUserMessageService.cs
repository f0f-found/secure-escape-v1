using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces
{
    public interface IUserMessageService
    {
        Task<List<UserMessageResponseDto>> GetAllAsync();

        Task<UserMessageResponseDto> CreateAsync(
            CreateUserMessageRequestDto request);

        Task<UserMessageResponseDto?> MarkAsReadAsync(Guid id);
    }
}