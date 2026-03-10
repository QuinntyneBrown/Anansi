using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Gift card with balance tracking (STR-2.4.3).
/// </summary>
public class GiftCard : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Code { get; set; } = string.Empty;

    /// <summary>Original amount in cents.</summary>
    public long OriginalAmountCents { get; set; }

    /// <summary>Remaining balance in cents (STR-2.4.3).</summary>
    public long BalanceCents { get; set; }

    /// <summary>Optional expiry date (STR-2.4.3).</summary>
    public DateTime? ExpiryDate { get; set; }

    /// <summary>Recipient email for branded email delivery (STR-2.4.3).</summary>
    public string? RecipientEmail { get; set; }

    /// <summary>Recipient name for branded email.</summary>
    public string? RecipientName { get; set; }

    /// <summary>Sender name for branded email.</summary>
    public string? SenderName { get; set; }

    /// <summary>Custom message.</summary>
    public string? Message { get; set; }

    public bool IsActive { get; set; } = true;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
