using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record BlogPostDto(
    Guid Id,
    Guid WebsiteId,
    string Title,
    string Slug,
    string? Excerpt,
    string BodyHtml,
    string? FeaturedImageUrl,
    BlogPostStatus Status,
    DateTime? PublishDate,
    DateTime? ScheduledPublishDate,
    string? MetaTitle,
    string? MetaDescription,
    string? OgImageUrl,
    string? ImportedFromUrl,
    List<BlogCategoryDto> Categories,
    DateTime CreatedAt,
    DateTime UpdatedAt);
