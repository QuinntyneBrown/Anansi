using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Integrations;

public class LabOrder : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? StoreOrderId { get; set; }
    public string LabName { get; set; } = string.Empty;
    public string? ExternalLabOrderId { get; set; }
    public LabOrderStatus Status { get; set; } = LabOrderStatus.Pending;
    public string ImageFileKey { get; set; } = string.Empty;
    public string ProductSpecifications { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string ShippingName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingProvince { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public long LabCostCents { get; set; }
    public long MarkupCents { get; set; }
    public long ClientPriceCents { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? TransmittedAt { get; set; }
    public DateTime? ShippedAt { get; set; }

    public Photographer? Photographer { get; set; }
}
