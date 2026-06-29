using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Services;

public class EmergencyContactService : IEmergencyContactService
{
    private readonly IEmergencyContactRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public EmergencyContactService(
        IEmergencyContactRepository repository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<EmergencyContactResponseDto>> GetAllAsync()
    {
        var currentUser = _currentUserService.GetCurrentUser();
        var contacts = await _repository.GetAllByUserIdAsync(currentUser.UserId);
        return contacts.Select(MapToResponse).ToList();
    }

    public async Task<EmergencyContactResponseDto> AddAsync(AddEmergencyContactRequestDto request)
    {
        var currentUser = _currentUserService.GetCurrentUser();

        // If this one is primary, demote all existing ones first
        if (request.IsPrimary)
        {
            var existing = await _repository.GetAllByUserIdAsync(currentUser.UserId);
            foreach (var c in existing.Where(x => x.IsPrimary))
            {
                c.IsPrimary = false;
                await _repository.UpdateAsync(c);
            }
        }

        var contact = new EmergencyContact
        {
            Id = Guid.NewGuid(),
            UserId = currentUser.UserId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Relationship = request.Relationship,
            IsPrimary = request.IsPrimary,
            NotifyOnDuress = request.NotifyOnDuress,
            Status = EmergencyContactStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(contact);
        await _unitOfWork.SaveChangesAsync();
        return MapToResponse(contact);
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUser = _currentUserService.GetCurrentUser();
        var contact = await _repository.GetByIdForUserAsync(id, currentUser.UserId);

        if (contact == null) return;

        await _repository.DeleteAsync(contact);
    }

    private static EmergencyContactResponseDto MapToResponse(EmergencyContact c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        PhoneNumber = c.PhoneNumber,
        Relationship = c.Relationship,
        IsPrimary = c.IsPrimary,
        NotifyOnDuress = c.NotifyOnDuress,
        CreatedAt = c.CreatedAt
    };
}