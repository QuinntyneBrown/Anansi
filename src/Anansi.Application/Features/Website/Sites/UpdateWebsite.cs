using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Sites;

/// <summary>
/// WEB-3.1.1 Template switching (preserves content), WEB-3.4.1/3.4.2/3.4.3 Typography & Design,
/// WEB-3.6.3 Password Protection, WEB-3.6.4 Right-Click Protection,
/// WEB-3.7.2 GA4 Integration, WEB-3.7.3 Facebook Pixel.
/// </summary>
public record UpdateWebsiteCommand(
    Guid WebsiteId,
    string? Name,
    string? Description,
    Guid? TemplateId,
    string? PrimaryFontFamily,
    string? SecondaryFontFamily,
    string? CustomFontUrl,
    string? ColorPaletteJson,
    AnimationType? AnimationType,
    bool? AnimationsEnabled,
    string? SitePassword,
    bool? ClearSitePassword,
    bool? RightClickProtectionEnabled,
    string? DefaultMetaTitle,
    string? DefaultMetaDescription,
    string? DefaultOgImageUrl,
    bool? BuiltInAnalyticsEnabled,
    string? GoogleAnalyticsMeasurementId,
    string? FacebookPixelId,
    BlogLayoutType? BlogLayout,
    int? BlogPostsPerPage,
    bool? BlogLoadMoreEnabled) : IRequest<Result<WebsiteDto>>;

public class UpdateWebsiteValidator : AbstractValidator<UpdateWebsiteCommand>
{
    public UpdateWebsiteValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.Name).MaximumLength(200).When(x => x.Name != null);
        RuleFor(x => x.BlogPostsPerPage).InclusiveBetween(1, 100).When(x => x.BlogPostsPerPage.HasValue);
    }
}

public class UpdateWebsiteHandler : IRequestHandler<UpdateWebsiteCommand, Result<WebsiteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateWebsiteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteDto>> Handle(UpdateWebsiteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);

        if (website is null)
            return Result<WebsiteDto>.NotFound("Website not found");

        // WEB-3.1.1: Template switching preserves content
        if (request.TemplateId.HasValue && request.TemplateId != website.TemplateId)
        {
            var templateExists = await _db.Set<Domain.Entities.Website.WebsiteTemplate>()
                .AnyAsync(t => t.Id == request.TemplateId.Value && t.IsActive, ct);
            if (!templateExists)
                return Result<WebsiteDto>.Failure("Template not found");
            website.TemplateId = request.TemplateId.Value;
        }

        if (request.Name != null) website.Name = request.Name;
        if (request.Description != null) website.Description = request.Description;
        if (request.PrimaryFontFamily != null) website.PrimaryFontFamily = request.PrimaryFontFamily;
        if (request.SecondaryFontFamily != null) website.SecondaryFontFamily = request.SecondaryFontFamily;
        if (request.CustomFontUrl != null) website.CustomFontUrl = request.CustomFontUrl;
        if (request.ColorPaletteJson != null) website.ColorPaletteJson = request.ColorPaletteJson;
        if (request.AnimationType.HasValue) website.AnimationType = request.AnimationType.Value;
        if (request.AnimationsEnabled.HasValue) website.AnimationsEnabled = request.AnimationsEnabled.Value;
        if (request.RightClickProtectionEnabled.HasValue) website.RightClickProtectionEnabled = request.RightClickProtectionEnabled.Value;
        if (request.DefaultMetaTitle != null) website.DefaultMetaTitle = request.DefaultMetaTitle;
        if (request.DefaultMetaDescription != null) website.DefaultMetaDescription = request.DefaultMetaDescription;
        if (request.DefaultOgImageUrl != null) website.DefaultOgImageUrl = request.DefaultOgImageUrl;
        if (request.BuiltInAnalyticsEnabled.HasValue) website.BuiltInAnalyticsEnabled = request.BuiltInAnalyticsEnabled.Value;
        if (request.GoogleAnalyticsMeasurementId != null) website.GoogleAnalyticsMeasurementId = request.GoogleAnalyticsMeasurementId;
        if (request.FacebookPixelId != null) website.FacebookPixelId = request.FacebookPixelId;
        if (request.BlogLayout.HasValue) website.BlogLayout = request.BlogLayout.Value;
        if (request.BlogPostsPerPage.HasValue) website.BlogPostsPerPage = request.BlogPostsPerPage.Value;
        if (request.BlogLoadMoreEnabled.HasValue) website.BlogLoadMoreEnabled = request.BlogLoadMoreEnabled.Value;

        // Password handling (WEB-3.6.3)
        if (request.ClearSitePassword == true)
            website.SitePasswordHash = null;
        else if (request.SitePassword != null)
            website.SitePasswordHash = BCryptHash(request.SitePassword);

        website.UpdatedBy = _currentUser.UserId;
        await _db.SaveChangesAsync(ct);

        return Result<WebsiteDto>.Success(MapToDto(website));
    }

    private static string BCryptHash(string password)
    {
        // Simple hash placeholder - in production use BCrypt or similar
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static WebsiteDto MapToDto(Domain.Entities.Website.Website w) => new(
        w.Id, w.PhotographerId, w.Name, w.Description, w.Status,
        w.TemplateId, w.PrimaryFontFamily, w.SecondaryFontFamily, w.CustomFontUrl,
        w.ColorPaletteJson, w.AnimationType, w.AnimationsEnabled,
        w.Subdomain, w.SslEnabled, w.CustomDomain, w.CustomDomainVerified,
        w.RightClickProtectionEnabled, w.DefaultMetaTitle, w.DefaultMetaDescription,
        w.DefaultOgImageUrl, w.BuiltInAnalyticsEnabled,
        w.GoogleAnalyticsMeasurementId, w.FacebookPixelId,
        w.BlogLayout, w.BlogPostsPerPage, w.BlogLoadMoreEnabled,
        w.SitePasswordHash != null, w.CreatedAt, w.UpdatedAt);
}
