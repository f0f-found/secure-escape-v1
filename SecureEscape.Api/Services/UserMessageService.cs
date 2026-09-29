using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services
{
    public class UserMessageService : IUserMessageService
    {
        private readonly IUserMessageRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public UserMessageService(
            IUserMessageRepository repository,
            ICurrentUserService currentUserService,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<UserMessageResponseDto>> GetAllAsync()
        {
            var currentUser = _currentUserService.GetCurrentUser();

            var messages =
                await _repository.GetAllByUserIdAsync(currentUser.UserId);

            return messages
                .Select(MapToResponse)
                .ToList();
        }

        public async Task<UserMessageResponseDto> CreateAsync(
            CreateUserMessageRequestDto request)
        {
            var currentUser = _currentUserService.GetCurrentUser();

            if (!string.IsNullOrWhiteSpace(request.DeduplicationKey))
            {
                var existing =
                    await _repository.GetByDeduplicationKeyAsync(
                        currentUser.UserId,
                        request.DeduplicationKey);

                if (existing != null)
                {
                    return MapToResponse(existing);
                }
            }

            var message = new UserMessage
            {
                Id = Guid.NewGuid(),
                UserId = currentUser.UserId,
                Title = request.Title.Trim(),
                Body = request.Body.Trim(),
                Category = request.Category.Trim(),
                ReferenceType =
                    string.IsNullOrWhiteSpace(request.ReferenceType)
                        ? null
                        : request.ReferenceType.Trim(),
                ReferenceId =
                    string.IsNullOrWhiteSpace(request.ReferenceId)
                        ? null
                        : request.ReferenceId.Trim(),
                DeduplicationKey =
                    string.IsNullOrWhiteSpace(request.DeduplicationKey)
                        ? null
                        : request.DeduplicationKey.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddAsync(message);
            await _unitOfWork.SaveChangesAsync();

            return MapToResponse(message);
        }

        public async Task<UserMessageResponseDto?> MarkAsReadAsync(Guid id)
        {
            var currentUser = _currentUserService.GetCurrentUser();

            var message =
                await _repository.GetByIdForUserAsync(
                    id,
                    currentUser.UserId);

            if (message == null)
            {
                return null;
            }

            if (!message.IsRead)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;

                await _repository.UpdateAsync(message);
                await _unitOfWork.SaveChangesAsync();
            }

            return MapToResponse(message);
        }

        private static UserMessageResponseDto MapToResponse(
            UserMessage message)
        {
            return new UserMessageResponseDto
            {
                Id = message.Id,
                Title = message.Title,
                Body = message.Body,
                Category = message.Category,
                ReferenceType = message.ReferenceType,
                ReferenceId = message.ReferenceId,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt,
                ReadAt = message.ReadAt
            };
        }
    }
}