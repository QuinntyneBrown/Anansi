using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Plans;

public record SubscriptionDto(
    Guid Id,
    Guid PlanId,
    string PlanName,
    PlanProduct PlanProduct,
    PlanTier PlanTier,
    BillingInterval BillingInterval,
    SubscriptionStatus Status,
    DateTime CurrentPeriodStart,
    DateTime CurrentPeriodEnd,
    long PriceCents,
    long ProrationCreditCents,
    DateTime? CancelledAt,
    bool CancelAtPeriodEnd,
    DateTime CreatedAt);

public record CreateSubscriptionRequest(
    Guid PlanId,
    BillingInterval BillingInterval);

public record ChangeSubscriptionRequest(
    Guid NewPlanId,
    BillingInterval BillingInterval);

public record FeatureCheckResult(
    string FeatureKey,
    bool IsAllowed,
    string? CurrentValue,
    string? Message);
