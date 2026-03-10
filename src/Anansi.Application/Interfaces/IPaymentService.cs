namespace Anansi.Application.Interfaces;

public interface IPaymentService
{
    Task<string> CreatePaymentIntentAsync(long amountCents, string currency, string stripeAccountId, Dictionary<string, string>? metadata = null, CancellationToken ct = default);
    Task<string> CreateCheckoutSessionAsync(string stripeAccountId, IEnumerable<(string name, long unitAmountCents, int qty)> lineItems, string successUrl, string cancelUrl, CancellationToken ct = default);
    Task RefundAsync(string paymentIntentId, long? amountCents = null, CancellationToken ct = default);
    Task<string> CreateConnectedAccountAsync(string email, string country, CancellationToken ct = default);
}
