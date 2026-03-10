using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Invoice line item (INV-4.5.1).
/// </summary>
public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Quantity { get; set; } = 1;

    /// <summary>Unit price in cents.</summary>
    public long UnitPriceCents { get; set; }

    /// <summary>Calculated total in cents (Quantity * UnitPriceCents).</summary>
    public long TotalCents { get; set; }

    public int SortOrder { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
}
