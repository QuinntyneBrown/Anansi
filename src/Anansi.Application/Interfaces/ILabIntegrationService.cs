namespace Anansi.Application.Interfaces;

public interface ILabIntegrationService
{
    Task<string> SubmitOrderAsync(LabOrderRequest request, CancellationToken ct = default);
    Task<LabOrderStatusResult> GetOrderStatusAsync(string labName, string externalOrderId, CancellationToken ct = default);
    Task<IReadOnlyList<LabPricingResult>> GetPricingAsync(string labName, CancellationToken ct = default);
}

public class LabOrderRequest
{
    public string LabName { get; set; } = string.Empty;
    public string ImageFileUrl { get; set; } = string.Empty;
    public string ProductSpecifications { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string ShippingName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingProvince { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
}

public class LabOrderStatusResult
{
    public string Status { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
}

public class LabPricingResult
{
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public long LabCostCents { get; set; }
}
