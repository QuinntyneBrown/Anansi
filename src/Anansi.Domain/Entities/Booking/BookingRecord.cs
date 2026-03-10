using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Booking;

/// <summary>
/// A booked session (BKG-4.3.4, BKG-4.3.7).
/// </summary>
public class BookingRecord : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public Guid SessionTypeId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? ProjectId { get; set; }

    public string ClientFirstName { get; set; } = string.Empty;
    public string ClientLastName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? Location { get; set; }

    /// <summary>Auto-generated video call link (BKG-4.3.11).</summary>
    public string? VideoCallLink { get; set; }

    /// <summary>Google Calendar event ID for sync (BKG-4.3.5).</summary>
    public string? GoogleCalendarEventId { get; set; }

    /// <summary>Amount paid in cents.</summary>
    public long AmountPaidCents { get; set; }

    /// <summary>Coupon code applied (BKG-4.3.12).</summary>
    public string? CouponCode { get; set; }

    /// <summary>Discount amount in cents.</summary>
    public long DiscountCents { get; set; }

    public string? Notes { get; set; }

    // Navigation
    public SessionType SessionType { get; set; } = null!;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
