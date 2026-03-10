using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Client-fillable field within a contract (CON-4.4.2).
/// </summary>
public class ContractField : BaseEntity
{
    public Guid ContractId { get; set; }
    public string Label { get; set; } = string.Empty;

    /// <summary>Pre-fill value (CON-4.4.2).</summary>
    public string? DefaultValue { get; set; }

    /// <summary>Client-entered value.</summary>
    public string? Value { get; set; }

    /// <summary>Whether this is an auto-population variable like {{client_name}} (CON-4.4.3).</summary>
    public bool IsVariable { get; set; }

    /// <summary>Variable key, e.g. "client_name" (CON-4.4.3).</summary>
    public string? VariableKey { get; set; }

    public int SortOrder { get; set; }

    // Navigation
    public Contract Contract { get; set; } = null!;
}
