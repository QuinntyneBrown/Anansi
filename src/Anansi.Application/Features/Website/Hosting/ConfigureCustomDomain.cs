using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Hosting;

/// <summary>
/// WEB-3.6.2 - Custom Domain: configure custom domain with SSL.
/// </summary>
public record ConfigureWebsiteCustomDomainCommand(
    Guid WebsiteId,
    string CustomDomain) : IRequest<Result<WebsiteDto>>;

public class ConfigureWebsiteCustomDomainValidator : AbstractValidator<ConfigureWebsiteCustomDomainCommand>
{
    public ConfigureWebsiteCustomDomainValidator()
    {
        RuleFor(x => x.WebsiteId).NotEmpty();
        RuleFor(x => x.CustomDomain).NotEmpty().MaximumLength(500);
    }
}

public class ConfigureWebsiteCustomDomainHandler : IRequestHandler<ConfigureWebsiteCustomDomainCommand, Result<WebsiteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ConfigureWebsiteCustomDomainHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteDto>> Handle(ConfigureWebsiteCustomDomainCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);
        if (website is null)
            return Result<WebsiteDto>.NotFound("Website not found");

        // Check domain is not already in use
        var domainInUse = await _db.Set<Domain.Entities.Website.Website>()
            .AnyAsync(w => w.CustomDomain == request.CustomDomain && w.Id != website.Id, ct);
        if (domainInUse)
            return Result<WebsiteDto>.Failure("Domain is already in use");

        website.CustomDomain = request.CustomDomain;
        website.CustomDomainVerified = false; // Requires DNS verification
        website.UpdatedBy = _currentUser.UserId;
        await _db.SaveChangesAsync(ct);

        return Result<WebsiteDto>.Success(MapToDto(website));
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
