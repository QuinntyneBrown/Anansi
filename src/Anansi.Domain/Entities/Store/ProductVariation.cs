using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// Product size/variation with independent pricing (STR-2.1.1, STR-2.1.2, STR-2.3.1).
/// </summary>
public class ProductVariation : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }

    /// <summary>Lab cost in cents (STR-2.3.1).</summary>
    public long CostCents { get; set; }

    /// <summary>Markup/profit in cents (STR-2.3.1).</summary>
    public long MarkupCents { get; set; }

    /// <summary>Final client-facing price in cents (cost + markup) (STR-2.3.1).</summary>
    public long PriceCents { get; set; }

    /// <summary>Whether this variation was individually customized or set via bulk markup (STR-2.3.2).</summary>
    public bool IsCustomPriced { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public Product Product { get; set; } = null!;
}
