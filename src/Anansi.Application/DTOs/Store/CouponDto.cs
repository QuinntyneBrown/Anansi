using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Store;

public record CouponDto(
    Guid Id,
    string Code,
    CouponType CouponType,
    CouponScope Scope,
    decimal? PercentageValue,
    long? FixedAmountCents,
    long? MinimumOrderCents,
    DateTime? ExpirationDate,
    int? UsageLimit,
    int TimesUsed,
    bool IsActive,
    string? BannerText,
    string? BannerColorHex,
    bool ShowBanner,
    DateTime CreatedAt);

public record CreateCouponRequest(
    string Code,
    CouponType CouponType,
    CouponScope Scope,
    decimal? PercentageValue,
    long? FixedAmountCents,
    long? MinimumOrderCents,
    DateTime? ExpirationDate,
    int? UsageLimit,
    string? BannerText,
    string? BannerColorHex,
    bool ShowBanner);

public record UpdateCouponRequest(
    string Code,
    bool IsActive,
    DateTime? ExpirationDate,
    int? UsageLimit,
    string? BannerText,
    string? BannerColorHex,
    bool ShowBanner);
