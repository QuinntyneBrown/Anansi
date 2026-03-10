using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Billing;

/// <summary>
/// Photographer's active subscription (PLN-10.1.2).
/// </summary>
public class Subscription : BaseEntity, ITenantEntity, ISoftDeletable
{
    public Guid PhotographerId { get; set; }
    public Guid PlanId { get; set; }
    public BillingInterval BillingInterval { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    /// <summary>Current period start.</summary>
    public DateTime CurrentPeriodStart { get; set; }

    /// <summary>Current period end.</summary>
    public DateTime CurrentPeriodEnd { get; set; }

    /// <summary>Stripe subscription ID.</summary>
    public string? StripeSubscriptionId { get; set; }

    /// <summary>Price being paid in cents for the current period.</summary>
    public long PriceCents { get; set; }

    /// <summary>Proration credit in cents when switching plans (PLN-10.1.2).</summary>
    public long ProrationCreditCents { get; set; }

    /// <summary>Date the subscription was cancelled, if applicable.</summary>
    public DateTime? CancelledAt { get; set; }

    /// <summary>Whether cancellation takes effect at period end.</summary>
    public bool CancelAtPeriodEnd { get; set; }

    // Navigation
    public Plan Plan { get; set; } = null!;

    // Soft-delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
