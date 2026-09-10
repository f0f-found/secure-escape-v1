using FluentAssertions;
using Moq;
using SecureEscape.Api.DTOs;
using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;
using SecureEscape.Api.Services;
using Xunit;

namespace SecureEscape.Api.Tests;

public class BeneficiaryServiceTests
{
    private readonly Mock<IBeneficiaryRepository> _repository = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private readonly Guid _userId = Guid.NewGuid();

    private BeneficiaryService BuildService()
    {
        _currentUserService.Setup(x => x.GetCurrentUser()).Returns(new CurrentUserContext
        {
            UserId = _userId,
            UserSessionId = Guid.NewGuid(),
            SessionMode = SessionMode.Normal,
            BankIntegrationId = Guid.NewGuid(),
            Email = "test.user@example.com",
            FullName = "Test User"
        });

        _unitOfWork.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        return new BeneficiaryService(_repository.Object, _currentUserService.Object, _unitOfWork.Object);
    }

    [Fact]
    public async Task AddAsync_AccountNumberAlreadyExists_ThrowsAndDoesNotAdd()
    {
        // Arrange
        var request = new AddBeneficiaryRequestDto
        {
            Name = "Duplicate Beneficiary",
            BankName = "Test Bank",
            AccountNumber = "5001001001",
            Reference = "Rent"
        };

        _repository.Setup(x => x.GetByAccountNumberAsync(_userId, request.AccountNumber))
            .ReturnsAsync(new Beneficiary
            {
                Id = Guid.NewGuid(),
                UserId = _userId,
                Name = "Existing Beneficiary",
                AccountNumber = request.AccountNumber,
                Status = BeneficiaryStatus.Active
            });

        var service = BuildService();

        // Act
        var act = async () => await service.AddAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("A beneficiary with this account number already exists.");

        _repository.Verify(x => x.AddAsync(It.IsAny<Beneficiary>()), Times.Never);
    }

    [Fact]
    public async Task AddAsync_NewAccountNumber_CreatesActiveBeneficiary()
    {
        // Arrange
        var request = new AddBeneficiaryRequestDto
        {
            Name = "New Beneficiary",
            BankName = "Test Bank",
            AccountNumber = "5009009009",
            Reference = "Groceries"
        };

        _repository.Setup(x => x.GetByAccountNumberAsync(_userId, request.AccountNumber))
            .ReturnsAsync((Beneficiary?)null);

        Beneficiary? addedBeneficiary = null;
        _repository.Setup(x => x.AddAsync(It.IsAny<Beneficiary>()))
            .Callback<Beneficiary>(b => addedBeneficiary = b)
            .Returns(Task.CompletedTask);

        var service = BuildService();

        // Act
        var result = await service.AddAsync(request);

        // Assert
        result.Status.Should().Be(BeneficiaryStatus.Active);
        addedBeneficiary.Should().NotBeNull();
        addedBeneficiary!.UserId.Should().Be(_userId);
        addedBeneficiary.AccountNumber.Should().Be(request.AccountNumber);
        _unitOfWork.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeactivateAsync_BeneficiaryNotFoundForUser_ReturnsFalseWithoutThrowing()
    {
        // Arrange
        var beneficiaryId = Guid.NewGuid();

        _repository.Setup(x => x.GetByIdForUserAsync(beneficiaryId, _userId))
            .ReturnsAsync((Beneficiary?)null);

        var service = BuildService();

        // Act
        var result = await service.DeactivateAsync(beneficiaryId);

        // Assert
        result.Should().BeFalse();
        _repository.Verify(x => x.UpdateAsync(It.IsAny<Beneficiary>()), Times.Never);
        _unitOfWork.Verify(x => x.SaveChangesAsync(), Times.Never);
    }
}