using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record UrlRedirectDto(
    Guid Id,
    Guid WebsiteId,
    string SourcePath,
    string DestinationUrl,
    RedirectType RedirectType,
    bool IsActive,
    DateTime CreatedAt);
