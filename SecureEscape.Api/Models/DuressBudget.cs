using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecureEscape.Api.Models;

// The opening balance is fixed for the session; only RemainingBalance changes.
public class DuressBudget
{
    [Key]
    public Guid UserSessionId { get; set; }
    public Guid? BankAccountId { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal OriginalBalance { get; set; }
    [ConcurrencyCheck, Column(TypeName = "decimal(18,2)")]
    public decimal RemainingBalance { get; set; }
    public string ExistingBeneficiaryIdsJson { get; set; } = "[]";
}
