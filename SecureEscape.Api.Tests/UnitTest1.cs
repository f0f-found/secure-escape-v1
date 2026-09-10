using Moq;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Services;

namespace SecureEscape.Api.Tests;

public class AdminSessionServiceTests
{
    [Fact]
    public async Task GetDuressSessionDetailAsync_WhenSessionDoesNotExist_ReturnsNull()
    {
        // Arrange
        var notificationDispatchService = new Mock<INotificationDispatchService>();
        var userSessionRepository = new Mock<IUserSessionRepository>();
        var bankAccountRepository = new Mock<IBankAccountRepository>();
        var auditService = new Mock<IAuditService>();
        var unitOfWork = new Mock<IUnitOfWork>();

        var sessionId = Guid.NewGuid();

        userSessionRepository
            .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
            .ReturnsAsync((SecureEscape.Api.Models.UserSession?)null);

        var service = new AdminSessionService(
            notificationDispatchService.Object,
            userSessionRepository.Object,
            bankAccountRepository.Object,
            auditService.Object,
            unitOfWork.Object
        );

        // Act
        var result = await service.GetDuressSessionDetailAsync(
            sessionId,
            null
        );

        // Assert
        Assert.Null(result);
    }

    [Fact]
public async Task GetDuressSessionDetailAsync_WhenSessionExists_ReturnsSession()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();

    var existingSession = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId
    };

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(existingSession);

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    var result = await service.GetDuressSessionDetailAsync(
        sessionId,
        null
    );

    // Assert
    Assert.NotNull(result);
    Assert.Equal(sessionId, result.Id);
}

[Fact]
public async Task ClaimSessionAsync_WhenCaseIsUnassigned_AssignsAnalystAndSetsInvestigating()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var analystId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        AssignedAdminUserId = null
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(session);

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    await service.ClaimSessionAsync(
        sessionId,
        null,
        analystId
    );

    // Assert
    Assert.Equal(analystId, session.AssignedAdminUserId);
    Assert.NotNull(session.AssignedAt);
    Assert.Equal(
        SecureEscape.Api.Enums.CaseStatus.Investigating,
        session.CaseStatus
    );

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(session),
        Times.Once
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Once
    );
}

[Fact]
public async Task ClaimSessionAsync_WhenCaseIsAlreadyAssigned_DoesNotReassignCase()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var existingAnalystId = Guid.NewGuid();
    var secondAnalystId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        AssignedAdminUserId = existingAnalystId
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    var result = await service.ClaimSessionAsync(
        sessionId,
        null,
        secondAnalystId
    );

    // Assert
    Assert.Null(result);
    Assert.Equal(existingAnalystId, session.AssignedAdminUserId);

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(It.IsAny<SecureEscape.Api.Models.UserSession>()),
        Times.Never
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Never
    );
}

[Fact]
public async Task UpdateCaseStatusAsync_WhenSetToInvestigating_UpdatesCaseStatus()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var analystId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

   userSessionRepository
    .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
    .ReturnsAsync(session);

    var request = new SecureEscape.Api.DTOs.Request.UpdateCaseStatusRequestDto
    {
        CaseStatus = SecureEscape.Api.Enums.CaseStatus.Investigating,
        Notes = "Investigation started."
    };

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    await service.UpdateCaseStatusAsync(
        sessionId,
        request,
        null,
        analystId
    );

    // Assert
    Assert.Equal(
        SecureEscape.Api.Enums.CaseStatus.Investigating,
        session.CaseStatus
    );

    Assert.Equal(analystId, session.AssignedAdminUserId);

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(session),
        Times.Once
    );

    userSessionRepository.Verify(
        repo => repo.AddActionAsync(
            It.IsAny<SecureEscape.Api.Models.AlertAction>()
        ),
        Times.Once
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Once
    );
}

[Fact]
public async Task SubmitCaseReportAsync_WhenAssignedToAnalyst_SubmitsReportForReview()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var analystId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        AssignedAdminUserId = analystId
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(session);

    var request = new SecureEscape.Api.DTOs.Request.SubmitCaseReportRequestDto
    {
        InvestigationSummary = "Analyst investigated the duress alert.",
        ResolutionSummary = "Suspicious activity confirmed and escalated."
    };

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    await service.SubmitCaseReportAsync(
        sessionId,
        request,
        null,
        analystId
    );

    // Assert
    Assert.Equal(
        request.InvestigationSummary,
        session.InvestigationSummary
    );

    Assert.Equal(
        request.ResolutionSummary,
        session.ResolutionSummary
    );

    Assert.NotNull(session.ResolutionSubmittedAt);

    Assert.Equal(
        SecureEscape.Api.Enums.ManagerReviewStatus.PendingReview,
        session.ManagerReviewStatus
    );

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(session),
        Times.Once
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Once
    );
}

[Fact]
public async Task ManagerReviewCaseAsync_WhenApproved_ResolvesCase()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var managerId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        CaseStatus = SecureEscape.Api.Enums.CaseStatus.Investigating,
        ManagerReviewStatus =
            SecureEscape.Api.Enums.ManagerReviewStatus.PendingReview
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(session);

    var request =
        new SecureEscape.Api.DTOs.Request.ManagerReviewCaseRequestDto
        {
            ReviewStatus =
                SecureEscape.Api.Enums.ManagerReviewStatus.Approved,
            ReviewNotes = "Report approved by fraud manager."
        };

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    await service.ManagerReviewCaseAsync(
        sessionId,
        request,
        null,
        managerId
    );

    // Assert
    Assert.Equal(
        SecureEscape.Api.Enums.ManagerReviewStatus.Approved,
        session.ManagerReviewStatus
    );

    Assert.Equal(
        SecureEscape.Api.Enums.CaseStatus.Resolved,
        session.CaseStatus
    );

    Assert.Equal(
        managerId,
        session.ManagerReviewedByAdminUserId
    );

    Assert.Equal(
        managerId,
        session.ResolvedByAdminUserId
    );

    Assert.NotNull(session.ManagerReviewedAt);
    Assert.NotNull(session.CaseResolvedAt);

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(session),
        Times.Once
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Once
    );
}

[Fact]
public async Task ManagerReviewCaseAsync_WhenRejected_ReturnsCaseToInvestigating()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var managerId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        CaseStatus = SecureEscape.Api.Enums.CaseStatus.Investigating,
        ManagerReviewStatus =
            SecureEscape.Api.Enums.ManagerReviewStatus.PendingReview
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(session);

    var request =
        new SecureEscape.Api.DTOs.Request.ManagerReviewCaseRequestDto
        {
            ReviewStatus =
                SecureEscape.Api.Enums.ManagerReviewStatus.Rejected,
            ReviewNotes = "More investigation is required."
        };

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    await service.ManagerReviewCaseAsync(
        sessionId,
        request,
        null,
        managerId
    );

    // Assert
    Assert.Equal(
        SecureEscape.Api.Enums.ManagerReviewStatus.Rejected,
        session.ManagerReviewStatus
    );

    Assert.Equal(
        SecureEscape.Api.Enums.CaseStatus.Investigating,
        session.CaseStatus
    );

    Assert.Equal(
        managerId,
        session.ManagerReviewedByAdminUserId
    );

    Assert.Null(session.CaseResolvedAt);
    Assert.Null(session.ResolvedByAdminUserId);

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(session),
        Times.Once
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Once
    );
}

[Fact]
public async Task SubmitCaseReportAsync_WhenAnalystIsNotAssigned_DoesNotSubmitReport()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var assignedAnalystId = Guid.NewGuid();
    var differentAnalystId = Guid.NewGuid();
    var userId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        UserId = userId,
        AssignedAdminUserId = assignedAnalystId
    };

    userSessionRepository
        .Setup(repo => repo.GetByIdAsync(sessionId))
        .ReturnsAsync(session);

    var request = new SecureEscape.Api.DTOs.Request.SubmitCaseReportRequestDto
    {
        InvestigationSummary = "Attempted report submission.",
        ResolutionSummary = "This should not be saved."
    };

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    var result = await service.SubmitCaseReportAsync(
        sessionId,
        request,
        null,
        differentAnalystId
    );

    // Assert
    Assert.Null(result);

    Assert.Empty(session.InvestigationSummary);
    Assert.Empty(session.ResolutionSummary);
    Assert.Null(session.ResolutionSubmittedAt);

    userSessionRepository.Verify(
        repo => repo.UpdateAsync(It.IsAny<SecureEscape.Api.Models.UserSession>()),
        Times.Never
    );

    unitOfWork.Verify(
        uow => uow.SaveChangesAsync(),
        Times.Never
    );
}

[Fact]
public async Task GetDuressSessionDetailAsync_WhenBankIntegrationDoesNotMatch_ReturnsNull()
{
    // Arrange
    var notificationDispatchService = new Mock<INotificationDispatchService>();
    var userSessionRepository = new Mock<IUserSessionRepository>();
    var bankAccountRepository = new Mock<IBankAccountRepository>();
    var auditService = new Mock<IAuditService>();
    var unitOfWork = new Mock<IUnitOfWork>();

    var sessionId = Guid.NewGuid();
    var sessionBankIntegrationId = Guid.NewGuid();
    var requestingBankIntegrationId = Guid.NewGuid();

    var session = new SecureEscape.Api.Models.UserSession
    {
        Id = sessionId,
        User = new SecureEscape.Api.Models.User
        {
            BankIntegrationId = sessionBankIntegrationId
        }
    };

    userSessionRepository
        .Setup(repo => repo.GetDuressSessionDetailAsync(sessionId))
        .ReturnsAsync(session);

    var service = new AdminSessionService(
        notificationDispatchService.Object,
        userSessionRepository.Object,
        bankAccountRepository.Object,
        auditService.Object,
        unitOfWork.Object
    );

    // Act
    var result = await service.GetDuressSessionDetailAsync(
        sessionId,
        requestingBankIntegrationId
    );

    // Assert
    Assert.Null(result);
}
}