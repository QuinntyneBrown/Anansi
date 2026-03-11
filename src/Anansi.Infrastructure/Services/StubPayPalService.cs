using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubPayPalService : IPayPalService
{
    private readonly ILogger<StubPayPalService> _logger;

    public StubPayPalService(ILogger<StubPayPalService> logger)
    {
        _logger = logger;
    }

    public Task<string> CreateOrderAsync(string paypalEmail, long amountCents, string currency, string description, string returnUrl, string cancelUrl, CancellationToken ct = default)
    {
        var id = $"pp_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("PayPal order created: {Id} for {Amount} {Currency}", id, amountCents, currency);
        return Task.FromResult(id);
    }

    public Task<PayPalCaptureResult> CaptureOrderAsync(string orderId, CancellationToken ct = default)
    {
        _logger.LogInformation("PayPal order captured: {OrderId}", orderId);
        return Task.FromResult(new PayPalCaptureResult { CaptureId = $"cap_{orderId}", Status = "COMPLETED", IsSuccess = true });
    }

    public Task RefundAsync(string captureId, long? amountCents = null, CancellationToken ct = default)
    {
        _logger.LogInformation("PayPal refund for {CaptureId}", captureId);
        return Task.CompletedTask;
    }
}
