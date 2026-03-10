using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Contract with e-signature support (CON-4.4.1 through CON-4.4.7).
/// </summary>
public class Contract : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;

    /// <summary>Rich HTML content (CON-4.4.1).</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Custom header image URL for branding (CON-4.4.1).</summary>
    public string? HeaderImageUrl { get; set; }

    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    /// <summary>Expiry period in days after sending (CON-4.4.6). Null = no expiry.</summary>
    public int? ExpiryDays { get; set; }

    /// <summary>Date the contract was sent to client.</summary>
    public DateTime? SentAt { get; set; }

    /// <summary>Calculated expiry date (SentAt + ExpiryDays).</summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>Enable automatic reminders (CON-4.4.7).</summary>
    public bool AutoRemindersEnabled { get; set; }

    /// <summary>Reminder interval in days (CON-4.4.7).</summary>
    public int? ReminderIntervalDays { get; set; }

    public DateTime? LastReminderSentAt { get; set; }

    /// <summary>Is this saved as a reusable template? (CON-4.4.5)</summary>
    public bool IsTemplate { get; set; }

    public string? TemplateName { get; set; }

    // Navigation
    public Contact? Contact { get; set; }
    public ICollection<ContractField> Fields { get; set; } = new List<ContractField>();
    public ICollection<ContractSignature> Signatures { get; set; } = new List<ContractSignature>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
