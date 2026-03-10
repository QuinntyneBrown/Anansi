using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Quote / proposal (QOT-4.6.1 through QOT-4.6.3).
/// </summary>
public class Quote : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;

    /// <summary>Total in cents (auto-calculated from items).</summary>
    public long TotalCents { get; set; }

    public DateTime? SentAt { get; set; }
    public DateTime? AcceptedAt { get; set; }

    /// <summary>Auto-generated invoice ID upon acceptance (QOT-4.6.2).</summary>
    public Guid? GeneratedInvoiceId { get; set; }

    /// <summary>Is this saved as a reusable template? (QOT-4.6.3)</summary>
    public bool IsTemplate { get; set; }

    public string? TemplateName { get; set; }

    // Navigation
    public Contact? Contact { get; set; }
    public ICollection<QuoteItem> Items { get; set; } = new List<QuoteItem>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
