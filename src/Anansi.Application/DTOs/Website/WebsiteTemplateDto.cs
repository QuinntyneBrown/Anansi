using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record WebsiteTemplateDto(
    Guid Id,
    string Name,
    string? Description,
    TemplateCategory Category,
    string? PreviewImageUrl,
    string? ThumbnailUrl,
    bool IsActive,
    int SortOrder);
