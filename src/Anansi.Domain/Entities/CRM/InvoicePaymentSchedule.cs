using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Payment installment within an invoice (INV-4.5.2, INV-4.5.3).
/// </summary>
public class InvoicePaymentSchedule : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public string Label { get; set; } = string.Empty;

    /// <summary>Amount due in cents.</summary>
    public long AmountCents { get; set; }

    public DateTime DueDate { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PaymentIntentId { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
}
