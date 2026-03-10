using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Sites;

/// <summary>
/// WEB-3.1.3 - Any draft can be published to become the live site.
/// WEB-3.6.1 - Hosting: free SSL, subdomain.
/// </summary>
public record PublishWebsiteCommand(Guid WebsiteId) : IRequest<Result<WebsiteDto>>;

public class PublishWebsiteHandler : IRequestHandler<PublishWebsiteCommand, Result<WebsiteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public PublishWebsiteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteDto>> Handle(PublishWebsiteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);

        if (website is null)
            return Result<WebsiteDto>.NotFound("Website not found");

        // Archive any currently published site
        var currentPublished = await _db.Set<Domain.Entities.Website.Website>()
            .Where(w => w.PhotographerId == photographerId.Value && w.Status == WebsiteStatus.Published && w.Id != website.Id)
            .ToListAsync(ct);

        foreach (var pub in currentPublished)
            pub.Status = WebsiteStatus.Archived;

        website.Status = WebsiteStatus.Published;
        website.SslEnabled = true;
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
