using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubPaymentService : IPaymentService
{
    private readonly ILogger<StubPaymentService> _logger;

    public StubPaymentService(ILogger<StubPaymentService> logger)
    {
        _logger = logger;
    }

    public Task<string> CreatePaymentIntentAsync(long amountCents, string currency, string stripeAccountId, Dictionary<string, string>? metadata = null, CancellationToken ct = default)
    {
        var id = $"pi_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("Payment intent created: {Id} for {Amount} {Currency}", id, amountCents, currency);
        return Task.FromResult(id);
    }

    public Task<string> CreateCheckoutSessionAsync(string stripeAccountId, IEnumerable<(string name, long unitAmountCents, int qty)> lineItems, string successUrl, string cancelUrl, CancellationToken ct = default)
    {
        var id = $"cs_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("Checkout session created: {Id}", id);
        return Task.FromResult(id);
    }

    public Task RefundAsync(string paymentIntentId, long? amountCents = null, CancellationToken ct = default)
    {
        _logger.LogInformation("Refund issued for {PaymentIntentId}", paymentIntentId);
        return Task.CompletedTask;
    }

    public Task<string> CreateConnectedAccountAsync(string email, string country, CancellationToken ct = default)
    {
        var id = $"acct_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("Connected account created: {Id} for {Email}", id, email);
        return Task.FromResult(id);
    }
}
