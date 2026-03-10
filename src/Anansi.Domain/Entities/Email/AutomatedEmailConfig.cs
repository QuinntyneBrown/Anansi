using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Email;

/// <summary>
/// Configuration for automated emails (EML-5.3.1 through EML-5.3.4).
/// </summary>
public class AutomatedEmailConfig : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }

    /// <summary>
    /// Type: "BookingConfirmation", "SessionReminder", "ContractReminder",
    /// "InvoiceReminder", "QuestionnaireReminder", "GalleryExpiryReminder",
    /// "PaymentConfirmation".
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;

    /// <summary>Template ID to use for this automated email.</summary>
    public Guid? EmailTemplateId { get; set; }

    /// <summary>Timing offset in hours before event (e.g., session reminder 24h before).</summary>
    public int? TimingOffsetHours { get; set; }

    /// <summary>Reminder frequency in days for document/payment reminders.</summary>
    public int? ReminderFrequencyDays { get; set; }

    /// <summary>
    /// For gallery expiry: JSON of recipient types (EML-5.3.3)
    /// e.g. ["specific_clients","all_viewers","all_downloaders"]
    /// </summary>
    public string? RecipientTypes { get; set; }

    /// <summary>
    /// For gallery expiry: days before expiry to send (EML-5.3.3)
    /// e.g. "14,7,3"
    /// </summary>
    public string? DaysBeforeEvent { get; set; }
}
