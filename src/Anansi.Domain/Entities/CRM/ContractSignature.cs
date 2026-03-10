using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.CRM;

/// <summary>
/// Digital signature on a contract (CON-4.4.4).
/// </summary>
public class ContractSignature : BaseEntity
{
    public Guid ContractId { get; set; }
    public string SignerName { get; set; } = string.Empty;
    public string SignerEmail { get; set; } = string.Empty;

    /// <summary>"Photographer", "Client", "SecondClient" (CON-4.4.4).</summary>
    public string SignerRole { get; set; } = "Client";

    /// <summary>Base64 signature data or typed name.</summary>
    public string? SignatureData { get; set; }

    public DateTime? SignedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation
    public Contract Contract { get; set; } = null!;
}
