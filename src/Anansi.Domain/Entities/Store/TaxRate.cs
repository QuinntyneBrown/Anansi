using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Tax rate configurable by region/jurisdiction (STR-2.5.2).
/// </summary>
public class TaxRate : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>Region/jurisdiction identifier (e.g., state, province, country code).</summary>
    public string Region { get; set; } = string.Empty;

    /// <summary>Tax rate as percentage (e.g., 13.00 for 13%).</summary>
    public decimal Percentage { get; set; }

    public bool IsActive { get; set; } = true;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
