namespace Anansi.Application.DTOs.Website;

public record LandingPageTemplateDto(
    Guid Id,
    string Name,
    string? Description,
    string UseCase,
    string? PreviewImageUrl,
    bool IsActive,
    int SortOrder);
