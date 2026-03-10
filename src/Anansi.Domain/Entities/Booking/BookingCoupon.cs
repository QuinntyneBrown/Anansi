using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Booking;

/// <summary>
/// Booking-specific coupon (BKG-4.3.12).
/// </summary>
public class BookingCoupon : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Code { get; set; } = string.Empty;
    public CouponType CouponType { get; set; }

    /// <summary>Percentage value (0-100).</summary>
    public decimal? PercentageValue { get; set; }

    /// <summary>Fixed amount in cents.</summary>
    public long? FixedAmountCents { get; set; }

    public DateTime? ExpirationDate { get; set; }
    public int? UsageLimit { get; set; }
    public int TimesUsed { get; set; }
    public bool IsActive { get; set; } = true;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
