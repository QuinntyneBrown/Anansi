using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Integrations;

public class LabProduct : BaseEntity
{
    public string LabName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public long LabCostCents { get; set; }
    public DateTime PriceLastUpdated { get; set; } = DateTime.UtcNow;
    public bool IsAvailable { get; set; } = true;
}
