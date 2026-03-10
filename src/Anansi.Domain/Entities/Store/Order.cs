using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Store;

/// <summary>
/// A store order placed by a client (STR-2.5.4).
/// </summary>
public class Order : BaseEntity, ITenantEntity, ISoftDeletable, IAuditableEntity
{
    public Guid PhotographerId { get; set; }

    /// <summary>Client who placed the order.</summary>
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }

    // Shipping address
    public string? ShippingAddress { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingProvince { get; set; }
    public string? ShippingPostalCode { get; set; }
    public string? ShippingCountry { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>Stripe payment intent ID.</summary>
    public string? PaymentIntentId { get; set; }

    /// <summary>Interac e-Transfer payment reference (INT-20.2.2).</summary>
    public string? InteracPaymentReference { get; set; }

    /// <summary>Subtotal before tax/shipping in cents.</summary>
    public long SubtotalCents { get; set; }

    /// <summary>Tax amount in cents (STR-2.5.2).</summary>
    public long TaxCents { get; set; }

    /// <summary>Shipping cost in cents (STR-2.5.3).</summary>
    public long ShippingCents { get; set; }

    /// <summary>Discount amount in cents (from coupon/gift card).</summary>
    public long DiscountCents { get; set; }

    /// <summary>Total in cents.</summary>
    public long TotalCents { get; set; }

    /// <summary>Platform commission in cents (STR-2.3.4).</summary>
    public long CommissionCents { get; set; }

    /// <summary>Commission percentage applied (15% free, 0% paid).</summary>
    public decimal CommissionPercentage { get; set; }

    /// <summary>Applied coupon code, if any.</summary>
    public string? CouponCode { get; set; }

    /// <summary>Applied gift card code, if any.</summary>
    public string? GiftCardCode { get; set; }

    /// <summary>Tracking information (STR-2.2.2, STR-2.5.4).</summary>
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }

    /// <summary>Shipping method used.</summary>
    public Guid? ShippingMethodId { get; set; }

    /// <summary>Fulfillment type for the order (STR-2.2.1, STR-2.2.2).</summary>
    public FulfillmentType FulfillmentType { get; set; }

    /// <summary>Lab partner for lab-fulfilled orders (STR-2.2.3).</summary>
    public LabPartner? LabPartner { get; set; }

    /// <summary>External lab order reference.</summary>
    public string? LabOrderReference { get; set; }

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ShippingMethod? ShippingMethodNavigation { get; set; }

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Audit
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
