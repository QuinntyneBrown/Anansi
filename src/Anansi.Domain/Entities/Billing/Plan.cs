using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Billing;

/// <summary>
/// Plan definition for a product area (PLN-10.1.1, PLN-10.1.2, PLN-10.1.3).
/// </summary>
public class Plan : BaseEntity, ISoftDeletable
{
    public PlanProduct Product { get; set; }
    public PlanTier Tier { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Monthly price in cents (PLN-10.1.2).</summary>
    public long MonthlyPriceCents { get; set; }

    /// <summary>Annual price in cents (must be at least 15% off monthly) (PLN-10.1.2).</summary>
    public long AnnualPriceCents { get; set; }

    /// <summary>Whether this is a suite bundle plan (PLN-10.1.3).</summary>
    public bool IsSuiteBundle { get; set; }

    /// <summary>Whether this plan is publicly available for purchase.</summary>
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<PlanFeatureGate> FeatureGates { get; set; } = new List<PlanFeatureGate>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
