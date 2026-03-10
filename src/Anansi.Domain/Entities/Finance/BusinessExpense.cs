using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Finance;

/// <summary>
/// Business expense with HST paid for ITC tracking (TAX-21.4.1).
/// </summary>
public class BusinessExpense : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }

    /// <summary>Expense amount in cents (before HST).</summary>
    public long AmountCents { get; set; }

    /// <summary>HST paid on this expense in cents (ITC eligible).</summary>
    public long HstPaidCents { get; set; }

    /// <summary>Expense category for ITC breakdown.</summary>
    public ExpenseCategory Category { get; set; }

    /// <summary>Date the expense was incurred.</summary>
    public DateTime Date { get; set; }

    /// <summary>Description of the expense.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Vendor or supplier name.</summary>
    public string? Vendor { get; set; }
}
