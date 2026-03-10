using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Finance;

/// <summary>
/// HST tax profile for a photographer (TAX-21.1.1, TAX-21.1.2).
/// </summary>
public class TaxProfile : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }

    /// <summary>HST rate percentage, default 13%.</summary>
    public decimal HstRatePercent { get; set; } = 13m;

    /// <summary>HST registration number (e.g. RT 0001).</summary>
    public string? HstRegistrationNumber { get; set; }

    /// <summary>Registration status with CRA.</summary>
    public HstRegistrationStatus RegistrationStatus { get; set; } = HstRegistrationStatus.NotRegistered;

    /// <summary>Whether HST collection is enabled on invoices.</summary>
    public bool IsHstEnabled { get; set; }
}
