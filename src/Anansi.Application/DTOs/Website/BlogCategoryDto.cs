namespace Anansi.Application.DTOs.Website;

public record BlogCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    int SortOrder);
