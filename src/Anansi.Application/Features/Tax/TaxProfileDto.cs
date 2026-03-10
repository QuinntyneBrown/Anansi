using Anansi.Domain.Enums;

namespace Anansi.Application.Features.Tax;

public record TaxProfileDto(
    Guid Id,
    decimal HstRatePercent,
    string? HstRegistrationNumber,
    HstRegistrationStatus RegistrationStatus,
    bool IsHstEnabled);

public record BusinessExpenseDto(
    Guid Id,
    long AmountCents,
    long HstPaidCents,
    ExpenseCategory Category,
    DateTime Date,
    string Description,
    string? Vendor,
    DateTime CreatedAt);

public record ThresholdStatusDto(
    long RollingRevenueCents,
    decimal ThresholdPercentage,
    IReadOnlyList<QuarterlyBreakdownDto> QuarterlyBreakdown,
    ThresholdAlertLevel AlertLevel);

public record QuarterlyBreakdownDto(
    int Year,
    int Quarter,
    long RevenueCents);

public record ItcSummaryDto(
    long HstCollectedCents,
    long HstPaidOnExpensesCents,
    long NetHstOwingCents,
    IReadOnlyList<CategoryBreakdownDto> CategoryBreakdown);

public record CategoryBreakdownDto(
    ExpenseCategory Category,
    long HstPaidCents);
