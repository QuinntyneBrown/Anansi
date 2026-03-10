using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Sites;

public record ListWebsitesQuery(WebsiteStatus? Status = null) : IRequest<Result<List<WebsiteDto>>>;

public class ListWebsitesHandler : IRequestHandler<ListWebsitesQuery, Result<List<WebsiteDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListWebsitesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<WebsiteDto>>> Handle(ListWebsitesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<WebsiteDto>>.Failure("Not authenticated", 401);

        var query = _db.Set<Domain.Entities.Website.Website>()
            .Where(w => w.PhotographerId == photographerId.Value);

        if (request.Status.HasValue)
            query = query.Where(w => w.Status == request.Status.Value);

        var websites = await query
            .OrderByDescending(w => w.UpdatedAt)
            .Select(w => new WebsiteDto(
                w.Id, w.PhotographerId, w.Name, w.Description, w.Status,
                w.TemplateId, w.PrimaryFontFamily, w.SecondaryFontFamily, w.CustomFontUrl,
                w.ColorPaletteJson, w.AnimationType, w.AnimationsEnabled,
                w.Subdomain, w.SslEnabled, w.CustomDomain, w.CustomDomainVerified,
                w.RightClickProtectionEnabled, w.DefaultMetaTitle, w.DefaultMetaDescription,
                w.DefaultOgImageUrl, w.BuiltInAnalyticsEnabled,
                w.GoogleAnalyticsMeasurementId, w.FacebookPixelId,
                w.BlogLayout, w.BlogPostsPerPage, w.BlogLoadMoreEnabled,
                w.SitePasswordHash != null, w.CreatedAt, w.UpdatedAt))
            .ToListAsync(ct);

        return Result<List<WebsiteDto>>.Success(websites);
    }
}
