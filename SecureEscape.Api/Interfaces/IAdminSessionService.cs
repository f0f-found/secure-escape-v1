using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface IAdminSessionService
{
    Task<List<DuressSessionSummaryResponseDto>> GetDuressSessionsAsync(Guid? bankIntegrationId);

    Task<DuressSessionDetailResponseDto?> GetDuressSessionDetailAsync(Guid sessionId, Guid? bankIntegrationId);

    Task<DuressSessionDetailResponseDto?> AssignSessionAsync(
    Guid sessionId,
    AssignSessionRequestDto request,
    Guid? bankIntegrationId,
    Guid assignedByAdminUserId);

    Task<DuressSessionDetailResponseDto?> DispatchSessionNotificationsAsync(
        Guid sessionId,
        Guid? bankIntegrationId);

    Task<DuressSessionDetailResponseDto?> UpdateCaseStatusAsync(
        Guid sessionId,
        UpdateCaseStatusRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId);

    Task<DuressSessionDetailResponseDto?> AddCaseActionAsync(
        Guid sessionId,
        CreateCaseActionRequestDto request,
        Guid? bankIntegrationId,
        Guid adminUserId);

    Task<DuressSessionDetailResponseDto?> FreezeAccountAsync(
        Guid sessionId,
        Guid? bankIntegrationId,
        Guid adminUserId);

    Task<DuressSessionDetailResponseDto?> SubmitCaseReportAsync(
    Guid sessionId,
    SubmitCaseReportRequestDto request,
    Guid? bankIntegrationId,
    Guid adminUserId);

    Task<DuressSessionDetailResponseDto?> ManagerReviewCaseAsync(
        Guid sessionId,
        ManagerReviewCaseRequestDto request,
        Guid? bankIntegrationId,
        Guid managerAdminUserId);
}