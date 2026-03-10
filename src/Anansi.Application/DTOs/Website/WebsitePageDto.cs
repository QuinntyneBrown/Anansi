using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record WebsitePageDto(
    Guid Id,
    Guid WebsiteId,
    string Title,
    string Slug,
    WebsitePageType PageType,
    int SortOrder,
    bool IsVisible,
    bool ShowInNavigation,
    bool HasPassword,
    string? MetaTitle,
    string? MetaDescription,
    string? OgImageUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);
