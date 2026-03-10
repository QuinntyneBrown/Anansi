using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Invoice with line items and payment schedules (INV-4.5.1 through INV-4.5.7).
/// </summary>
public class Invoice : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? ProjectId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }

    /// <summary>Custom header image for branding (INV-4.5.1).</summary>
    public string? HeaderImageUrl { get; set; }

    /// <summary>Custom color hex for branding (INV-4.5.1).</summary>
    public string? BrandColorHex { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateTime? SentAt { get; set; }
    public DateTime? DueDate { get; set; }

    /// <summary>Subtotal in cents (auto-calculated from line items).</summary>
    public long SubtotalCents { get; set; }

    /// <summary>Tax rate percentage (INV-4.5.5).</summary>
    public decimal TaxRatePercent { get; set; }

    /// <summary>Tax amount in cents (INV-4.5.5).</summary>
    public long TaxAmountCents { get; set; }

    /// <summary>Discount amount in cents.</summary>
    public long DiscountCents { get; set; }

    /// <summary>Total in cents.</summary>
    public long TotalCents { get; set; }

    /// <summary>Amount paid so far in cents.</summary>
    public long PaidCents { get; set; }

    /// <summary>Enable tip options (INV-4.5.6).</summary>
    public bool TipsEnabled { get; set; }

    /// <summary>Tip amount received in cents (INV-4.5.6).</summary>
    public long TipAmountCents { get; set; }

    /// <summary>Deposit amount in cents (INV-4.5.3).</summary>
    public long? DepositAmountCents { get; set; }

    /// <summary>Enable automatic reminders (INV-4.5.4).</summary>
    public bool AutoRemindersEnabled { get; set; }

    /// <summary>Reminder interval days before/after due date (INV-4.5.4).</summary>
    public int? ReminderIntervalDays { get; set; }

    public DateTime? LastReminderSentAt { get; set; }

    /// <summary>Is this saved as a reusable template? (INV-4.5.7)</summary>
    public bool IsTemplate { get; set; }

    public string? TemplateName { get; set; }

    /// <summary>Custom header fields JSON (VAT, ABN, business ID) (INV-4.5.1).</summary>
    public string? CustomHeaderFields { get; set; }

    // Navigation
    public Contact? Contact { get; set; }
    public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
    public ICollection<InvoicePaymentSchedule> PaymentSchedules { get; set; } = new List<InvoicePaymentSchedule>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
