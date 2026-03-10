using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Branding;

public record CustomDomainDto(
    Guid Id,
    string DomainName,
    DomainPurpose Purpose,
    bool IsVerified,
    SslStatus SslStatus,
    DateTime? SslExpiresAt,
    string? DnsInstructions,
    DateTime? VerifiedAt,
    DateTime CreatedAt);
