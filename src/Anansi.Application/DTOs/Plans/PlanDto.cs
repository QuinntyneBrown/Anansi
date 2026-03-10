using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Plans;

public record PlanDto(
    Guid Id,
    PlanProduct Product,
    PlanTier Tier,
    string Name,
    string? Description,
    long MonthlyPriceCents,
    long AnnualPriceCents,
    bool IsSuiteBundle,
    bool IsActive,
    List<PlanFeatureGateDto> FeatureGates);

public record PlanFeatureGateDto(
    Guid Id,
    string FeatureKey,
    string FeatureValue,
    string? Description);

public record CreatePlanRequest(
    PlanProduct Product,
    PlanTier Tier,
    string Name,
    string? Description,
    long MonthlyPriceCents,
    long AnnualPriceCents,
    bool IsSuiteBundle,
    List<CreateFeatureGateRequest>? FeatureGates);

public record CreateFeatureGateRequest(
    string FeatureKey,
    string FeatureValue,
    string? Description);

public record UpdatePlanRequest(
    string Name,
    string? Description,
    long MonthlyPriceCents,
    long AnnualPriceCents,
    bool IsActive);
