using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record BookingCouponDto(
    Guid Id,
    string Code,
    CouponType CouponType,
    decimal? PercentageValue,
    long? FixedAmountCents,
    DateTime? ExpirationDate,
    int? UsageLimit,
    int TimesUsed,
    bool IsActive,
    DateTime CreatedAt);
