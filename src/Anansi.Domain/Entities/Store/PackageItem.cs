using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// An item within a package product (STR-2.1.5).
/// </summary>
public class PackageItem : BaseEntity
{
    public Guid PackageProductId { get; set; }
    public Guid IncludedProductId { get; set; }
    public Guid? IncludedVariationId { get; set; }
    public int Quantity { get; set; } = 1;

    // Navigation
    public Product PackageProduct { get; set; } = null!;
    public Product IncludedProduct { get; set; } = null!;
    public ProductVariation? IncludedVariation { get; set; }
}
