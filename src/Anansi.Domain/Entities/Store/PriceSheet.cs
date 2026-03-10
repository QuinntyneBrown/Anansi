using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// A named price sheet assignable to collections (STR-2.3.3).
/// </summary>
public class PriceSheet : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Download-only (digital products, no physical) (STR-2.3.3).</summary>
    public bool IsDownloadOnly { get; set; }

    /// <summary>Designated as the default for new collections (STR-2.3.3).</summary>
    public bool IsDefault { get; set; }

    // Navigation
    public ICollection<PriceSheetItem> Items { get; set; } = new List<PriceSheetItem>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
