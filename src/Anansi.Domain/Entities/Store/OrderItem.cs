using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Line item within an order (STR-2.5.4).
/// </summary>
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ProductVariationId { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string? VariationName { get; set; }

    public int Quantity { get; set; } = 1;

    /// <summary>Unit price in cents at time of purchase.</summary>
    public long UnitPriceCents { get; set; }

    /// <summary>Total price in cents (unit * qty).</summary>
    public long TotalCents { get; set; }

    /// <summary>Photo/image URL the client selected for this product.</summary>
    public string? SelectedPhotoUrl { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariation? ProductVariation { get; set; }
}
