using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Coupon/discount code (STR-2.4.1).
/// </summary>
public class Coupon : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Code { get; set; } = string.Empty;
    public CouponType CouponType { get; set; }
    public CouponScope Scope { get; set; }

    /// <summary>Percentage value for PercentageOff type (0-100).</summary>
    public decimal? PercentageValue { get; set; }

    /// <summary>Fixed amount in cents for FixedAmountOff type.</summary>
    public long? FixedAmountCents { get; set; }

    /// <summary>Minimum order threshold in cents (STR-2.4.1).</summary>
    public long? MinimumOrderCents { get; set; }

    public DateTime? ExpirationDate { get; set; }
    public int? UsageLimit { get; set; }
    public int TimesUsed { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Banner display text (STR-2.4.2).</summary>
    public string? BannerText { get; set; }

    /// <summary>Banner color hex (STR-2.4.2).</summary>
    public string? BannerColorHex { get; set; }

    /// <summary>Whether to show coupon banner on gallery/store (STR-2.4.2).</summary>
    public bool ShowBanner { get; set; }

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
