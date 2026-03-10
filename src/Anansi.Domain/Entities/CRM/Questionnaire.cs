using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Questionnaire with questions (QST-4.7.1 through QST-4.7.4).
/// </summary>
public class Questionnaire : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public QuestionnaireStatus Status { get; set; } = QuestionnaireStatus.Draft;

    public DateTime? SentAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    /// <summary>Allow multiple submissions when shared publicly (QST-4.7.3).</summary>
    public bool AllowMultipleSubmissions { get; set; }

    /// <summary>Public slug for shareable link (QST-4.7.3).</summary>
    public string? PublicSlug { get; set; }

    /// <summary>Expiry days after sending (QST-4.7.4).</summary>
    public int? ExpiryDays { get; set; }

    public DateTime? ExpiresAt { get; set; }

    /// <summary>Enable automatic reminders (QST-4.7.4).</summary>
    public bool AutoRemindersEnabled { get; set; }

    public int? ReminderIntervalDays { get; set; }
    public DateTime? LastReminderSentAt { get; set; }

    /// <summary>Is this saved as a reusable template? (QST-4.7.2)</summary>
    public bool IsTemplate { get; set; }

    public string? TemplateName { get; set; }

    // Navigation
    public Contact? Contact { get; set; }
    public ICollection<QuestionnaireQuestion> Questions { get; set; } = new List<QuestionnaireQuestion>();
    public ICollection<QuestionnaireResponse> Responses { get; set; } = new List<QuestionnaireResponse>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
