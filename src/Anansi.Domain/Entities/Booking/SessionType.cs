using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Booking;

/// <summary>
/// Full session type definition (BKG-4.3.2, BKG-4.3.8).
/// </summary>
public class SessionType : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }

    /// <summary>Session price in cents.</summary>
    public long PriceCents { get; set; }

    public string? Location { get; set; }

    /// <summary>Public or Hidden (BKG-4.3.8).</summary>
    public SessionVisibility Visibility { get; set; } = SessionVisibility.Public;

    /// <summary>Sort order on the booking site (BKG-4.3.8).</summary>
    public int SortOrder { get; set; }

    /// <summary>Buffer time before session in minutes (BKG-4.3.6).</summary>
    public int BufferBeforeMinutes { get; set; }

    /// <summary>Buffer time after session in minutes (BKG-4.3.6).</summary>
    public int BufferAfterMinutes { get; set; }

    /// <summary>Require manual confirmation (BKG-4.3.7).</summary>
    public bool RequireManualConfirmation { get; set; }

    /// <summary>Is this a mini session type? (BKG-4.3.3)</summary>
    public bool IsMiniSession { get; set; }

    /// <summary>Gap between mini session slots in minutes (BKG-4.3.3).</summary>
    public int MiniSessionGapMinutes { get; set; }

    /// <summary>Number of spots per mini session time slot (BKG-4.3.3).</summary>
    public int MiniSessionSpotsPerSlot { get; set; } = 1;

    /// <summary>JSON availability windows [{dayOfWeek, startTime, endTime}] (BKG-4.3.2).</summary>
    public string? AvailabilityWindows { get; set; }

    /// <summary>Video call type: "Zoom", "GoogleMeet", or null (BKG-4.3.11).</summary>
    public string? VideoCallType { get; set; }

    /// <summary>Require full payment or deposit (BKG-4.3.10).</summary>
    public bool RequirePayment { get; set; }

    /// <summary>If split, deposit amount in cents (BKG-4.3.10).</summary>
    public long? DepositAmountCents { get; set; }

    /// <summary>JSON list of intake document template IDs (BKG-4.3.9).</summary>
    public string? IntakeDocumentIds { get; set; }

    /// <summary>Cover image URL for booking site.</summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>Optional link to a community event (EVT-24.2.3).</summary>
    public Guid? CommunityEventId { get; set; }

    // Navigation
    public ICollection<MiniSessionDate> MiniSessionDates { get; set; } = new List<MiniSessionDate>();
    public ICollection<BookingRecord> Bookings { get; set; } = new List<BookingRecord>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
