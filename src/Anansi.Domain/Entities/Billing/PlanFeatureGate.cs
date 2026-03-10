using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Billing;

/// <summary>
/// Feature gating entry for a plan (PLN-10.2.1 through PLN-10.2.4).
/// </summary>
public class PlanFeatureGate : BaseEntity
{
    public Guid PlanId { get; set; }

    /// <summary>Feature key identifier (e.g., "storage_gb", "video_hours", "store_commission_pct").</summary>
    public string FeatureKey { get; set; } = string.Empty;

    /// <summary>Feature value (e.g., "3", "unlimited", "true", "15").</summary>
    public string FeatureValue { get; set; } = string.Empty;

    /// <summary>Human-readable feature description.</summary>
    public string? Description { get; set; }

    // Navigation
    public Plan Plan { get; set; } = null!;
}
