using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Links a product variation to a price sheet with an override price (STR-2.3.3).
/// </summary>
public class PriceSheetItem : BaseEntity
{
    public Guid PriceSheetId { get; set; }
    public Guid ProductVariationId { get; set; }

    /// <summary>Override price in cents for this sheet.</summary>
    public long PriceCents { get; set; }

    // Navigation
    public PriceSheet PriceSheet { get; set; } = null!;
    public ProductVariation ProductVariation { get; set; } = null!;
}
