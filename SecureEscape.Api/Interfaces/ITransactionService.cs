using SecureEscape.Api.DTOs.Request;
using SecureEscape.Api.DTOs.Response;

namespace SecureEscape.Api.Interfaces;

public interface ITransactionService
{
    Task<List<TransactionResponseDto>> GetAllAsync();
    Task<TransactionResponseDto> CreateAsync(CreateTransactionRequestDto request);
}