using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Finance;

/// <summary>
/// Business financing / capital application (CAP-4.11.1, CAP-4.11.2).
/// </summary>
public class FinancingApplication : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }

    /// <summary>Requested funding amount in cents.</summary>
    public long RequestedAmountCents { get; set; }

    /// <summary>Offered funding amount in cents (CAP-4.11.1).</summary>
    public long? OfferedAmountCents { get; set; }

    /// <summary>Flat fee in cents (no compounding interest) (CAP-4.11.1).</summary>
    public long? FlatFeeCents { get; set; }

    /// <summary>Repayment percentage of incoming payments (CAP-4.11.2).</summary>
    public decimal? RepaymentPercentage { get; set; }

    /// <summary>Total repaid so far in cents.</summary>
    public long RepaidCents { get; set; }

    /// <summary>Status: Pending, Approved, Active, Repaid, Declined.</summary>
    public string Status { get; set; } = "Pending";

    public DateTime? ApprovedAt { get; set; }
    public DateTime? FundedAt { get; set; }
    public DateTime? RepaidAt { get; set; }
}
