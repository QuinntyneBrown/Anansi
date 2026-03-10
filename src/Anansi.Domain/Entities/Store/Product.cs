using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Represents a store product (prints, albums, cards, digital, packages, self-fulfilled).
/// Covers STR-2.1.1 through STR-2.1.6.
/// </summary>
public class Product : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductType ProductType { get; set; }
    public FulfillmentType FulfillmentType { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Lab partner for lab-fulfilled products (STR-2.2.1, STR-2.2.3).</summary>
    public LabPartner? LabPartner { get; set; }

    /// <summary>For lab color correction options (STR-2.2.1).</summary>
    public bool LabColorCorrectionEnabled { get; set; }

    /// <summary>Preview image URL overlaying client photo on product (STR-2.1.1).</summary>
    public string? PreviewImageUrl { get; set; }

    /// <summary>For digital downloads: resolution options (STR-2.1.4).</summary>
    public string? DigitalResolutionOptions { get; set; }

    // Navigation
    public ICollection<ProductVariation> Variations { get; set; } = new List<ProductVariation>();
    public ICollection<PackageItem> PackageItems { get; set; } = new List<PackageItem>();

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
