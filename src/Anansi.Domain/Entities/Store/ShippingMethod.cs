using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Shipping method with cost (STR-2.5.3).
/// </summary>
public class ShippingMethod : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Flat rate shipping cost in cents.</summary>
    public long CostCents { get; set; }

    /// <summary>Estimated delivery days (e.g., "3-5 business days").</summary>
    public string? EstimatedDelivery { get; set; }

    public bool IsActive { get; set; } = true;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
