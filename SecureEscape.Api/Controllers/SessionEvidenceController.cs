using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureEscape.Api.Data;
using SecureEscape.Api.Enums;
using SecureEscape.Api.Interfaces;
using SecureEscape.Api.Models;

namespace SecureEscape.Api.Controllers
{
    [ApiController]
    [Route("api/v1/session-evidence")]
    [Authorize]
    public class SessionEvidenceController : ControllerBase
    {
        private const long MaxPhotoSizeBytes = 10 * 1024 * 1024;

        private static readonly HashSet<string> AllowedContentTypes =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/heic",
                "image/heif"
            };

        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;
        private readonly IWebHostEnvironment _environment;

        public SessionEvidenceController(
            AppDbContext dbContext,
            ICurrentUserService currentUserService,
            IWebHostEnvironment environment)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
            _environment = environment;
        }

        [HttpPost("current-photo")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxPhotoSizeBytes)]
        public async Task<IActionResult> UploadCurrentPhoto(
            [FromForm] IFormFile photo,
            [FromForm] Guid? bankTransactionId,
            CancellationToken cancellationToken)
        {
            var currentUser = _currentUserService.GetCurrentUser();

            if (currentUser.SessionMode != SessionMode.Duress)
            {
                return NotFound();
            }

            var session = await _dbContext.UserSessions
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == currentUser.UserSessionId &&
                        x.UserId == currentUser.UserId &&
                        x.Mode == SessionMode.Duress,
                    cancellationToken);

            if (session == null)
            {
                return NotFound();
            }

            if (photo == null || photo.Length == 0)
            {
                return BadRequest(new
                {
                    message = "A current photo is required."
                });
            }

            if (photo.Length > MaxPhotoSizeBytes)
            {
                return BadRequest(new
                {
                    message = "The photo is too large."
                });
            }

            if (string.IsNullOrWhiteSpace(photo.ContentType) ||
                !AllowedContentTypes.Contains(photo.ContentType))
            {
                return BadRequest(new
                {
                    message = "Unsupported image format."
                });
            }

            BankTransaction? transaction = null;

            if (bankTransactionId.HasValue)
            {
                transaction = await _dbContext.BankTransactions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id == bankTransactionId.Value &&
                            x.UserId == currentUser.UserId &&
                            x.UserSessionId == currentUser.UserSessionId,
                        cancellationToken);

                if (transaction == null)
                {
                    return BadRequest(new
                    {
                        message =
                            "The transaction could not be linked to this security confirmation."
                    });
                }
            }

            var evidenceId = Guid.NewGuid();

            var extension = GetSafeExtension(photo.ContentType);

            var storedFileName = $"{evidenceId:N}{extension}";

            var relativeDirectory = Path.Combine(
                "App_Data",
                "SessionEvidence",
                currentUser.UserSessionId.ToString("N"));

            var absoluteDirectory = Path.Combine(
                _environment.ContentRootPath,
                relativeDirectory);

            Directory.CreateDirectory(absoluteDirectory);

            var absolutePath = Path.Combine(
                absoluteDirectory,
                storedFileName);

            try
            {
                await using (var stream = new FileStream(
                    absolutePath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None))
                {
                    await photo.CopyToAsync(
                        stream,
                        cancellationToken);
                }

                var evidence = new SessionEvidence
                {
                    Id = evidenceId,
                    UserSessionId = currentUser.UserSessionId,
                    BankTransactionId = transaction?.Id,
                    EvidenceType = "CurrentPhoto",
                    FileName = storedFileName,
                    StoragePath = Path.Combine(
                            relativeDirectory,
                            storedFileName)
                        .Replace('\\', '/'),
                    ContentType = photo.ContentType,
                    FileSizeBytes = photo.Length,
                    CapturedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.SessionEvidence.Add(evidence);

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                return Ok(new
                {
                    id = evidence.Id,
                    evidenceType = evidence.EvidenceType,
                    bankTransactionId = evidence.BankTransactionId,
                    capturedAt = evidence.CapturedAt
                });
            }
            catch
            {
                if (System.IO.File.Exists(absolutePath))
                {
                    System.IO.File.Delete(absolutePath);
                }

                throw;
            }
        }

        private static string GetSafeExtension(
            string contentType)
        {
            return contentType.ToLowerInvariant() switch
            {
                "image/png" => ".png",
                "image/heic" => ".heic",
                "image/heif" => ".heif",
                _ => ".jpg"
            };
        }
    }
}