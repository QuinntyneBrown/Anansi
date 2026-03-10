using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Website;

public record WebsiteDto(
    Guid Id,
    Guid PhotographerId,
    string Name,
    string? Description,
    WebsiteStatus Status,
    Guid? TemplateId,
    string? PrimaryFontFamily,
    string? SecondaryFontFamily,
    string? CustomFontUrl,
    string? ColorPaletteJson,
    AnimationType AnimationType,
    bool AnimationsEnabled,
    string Subdomain,
    bool SslEnabled,
    string? CustomDomain,
    bool CustomDomainVerified,
    bool RightClickProtectionEnabled,
    string? DefaultMetaTitle,
    string? DefaultMetaDescription,
    string? DefaultOgImageUrl,
    bool BuiltInAnalyticsEnabled,
    string? GoogleAnalyticsMeasurementId,
    string? FacebookPixelId,
    BlogLayoutType BlogLayout,
    int BlogPostsPerPage,
    bool BlogLoadMoreEnabled,
    bool HasSitePassword,
    DateTime CreatedAt,
    DateTime UpdatedAt);
