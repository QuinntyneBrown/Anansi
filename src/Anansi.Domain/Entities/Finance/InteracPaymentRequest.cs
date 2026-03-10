using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Finance;

/// <summary>
/// Interac e-Transfer payment request linked to an invoice (INT-20.1.1 through INT-20.1.4).
/// </summary>
public class InteracPaymentRequest : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid InvoiceId { get; set; }

    /// <summary>Amount requested in cents.</summary>
    public long AmountCents { get; set; }

    /// <summary>Unique payment reference (e.g. ANANSI-INV-XXXX).</summary>
    public string PaymentReference { get; set; } = string.Empty;

    /// <summary>Email address where Interac e-Transfer should be sent.</summary>
    public string RecipientEmail { get; set; } = string.Empty;

    /// <summary>Current status of the payment request.</summary>
    public InteracPaymentStatus Status { get; set; } = InteracPaymentStatus.Pending;

    /// <summary>When the payment request expires.</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>When the payment was confirmed as received.</summary>
    public DateTime? ConfirmedAt { get; set; }
}
