using Anansi.Domain.Common;
using Anansi.Domain.Enums;

namespace Anansi.Domain.Entities.Branding;

/// <summary>
/// BRD-7.3.1 Gallery Custom Domain, BRD-7.3.2 Website Custom Domain.
/// </summary>
public class CustomDomain : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public DomainPurpose Purpose { get; set; }
    public bool IsVerified { get; set; }
    public SslStatus SslStatus { get; set; } = SslStatus.Pending;
    public string? SslCertificateId { get; set; }
    public DateTime? SslExpiresAt { get; set; }
    public string? DnsInstructions { get; set; }
    public string? VerificationToken { get; set; }
    public DateTime? VerifiedAt { get; set; }
}
