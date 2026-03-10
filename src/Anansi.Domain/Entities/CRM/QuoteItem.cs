using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Line item within a quote (QOT-4.6.1).
/// </summary>
public class QuoteItem : BaseEntity
{
    public Guid QuoteId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Quantity { get; set; } = 1;

    /// <summary>Unit price in cents.</summary>
    public long UnitPriceCents { get; set; }

    /// <summary>Calculated total in cents.</summary>
    public long TotalCents { get; set; }

    public int SortOrder { get; set; }

    // Navigation
    public Quote Quote { get; set; } = null!;
}
