using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Finance;

/// <summary>
/// Transaction record for all payments (PAY-4.8.1 through PAY-4.8.8, RPT-4.10.2).
/// </summary>
public class PaymentRecord : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? BookingId { get; set; }

    /// <summary>Gross amount in cents.</summary>
    public long AmountCents { get; set; }

    /// <summary>Fee amount in cents (PAY-4.8.1: 2.9% + $0.30, etc.).</summary>
    public long FeeCents { get; set; }

    /// <summary>Net amount in cents (AmountCents - FeeCents).</summary>
    public long NetAmountCents { get; set; }

    /// <summary>Tip amount in cents (PAY-4.8.6).</summary>
    public long TipCents { get; set; }

    /// <summary>Tax amount in cents.</summary>
    public long TaxCents { get; set; }

    public string Currency { get; set; } = "usd";
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>Stripe PaymentIntent ID or external reference.</summary>
    public string? ExternalPaymentId { get; set; }

    /// <summary>Last 4 digits of card (RPT-4.10.2).</summary>
    public string? CardLast4 { get; set; }

    public string? Description { get; set; }

    /// <summary>For offline payments (PAY-4.8.7).</summary>
    public bool IsOffline { get; set; }

    /// <summary>For refunds.</summary>
    public bool IsRefund { get; set; }

    /// <summary>Gift card ID if used.</summary>
    public Guid? GiftCardId { get; set; }
}
