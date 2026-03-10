namespace Anansi.Application.Interfaces;

public interface IPayPalService
{
    Task<string> CreateOrderAsync(string paypalEmail, long amountCents, string currency, string description, string returnUrl, string cancelUrl, CancellationToken ct = default);
    Task<PayPalCaptureResult> CaptureOrderAsync(string orderId, CancellationToken ct = default);
    Task RefundAsync(string captureId, long? amountCents = null, CancellationToken ct = default);
}

public class PayPalCaptureResult
{
    public string CaptureId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
}
