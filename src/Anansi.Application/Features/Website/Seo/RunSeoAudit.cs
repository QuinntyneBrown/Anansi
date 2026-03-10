using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Seo;

/// <summary>
/// WEB-3.5.1 - SEO Manager: audit identifying missing titles, descriptions, alt text.
/// </summary>
public record RunSeoAuditQuery(Guid WebsiteId) : IRequest<Result<SeoAuditResultDto>>;

public class RunSeoAuditHandler : IRequestHandler<RunSeoAuditQuery, Result<SeoAuditResultDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RunSeoAuditHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<SeoAuditResultDto>> Handle(RunSeoAuditQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<SeoAuditResultDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);
        if (website is null)
            return Result<SeoAuditResultDto>.NotFound("Website not found");

        var pages = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .Where(p => p.WebsiteId == request.WebsiteId && p.PhotographerId == photographerId.Value)
            .ToListAsync(ct);

        var issues = new List<SeoIssueDto>();

        foreach (var page in pages)
        {
            if (string.IsNullOrWhiteSpace(page.MetaTitle))
                issues.Add(new SeoIssueDto(page.Title, page.Slug, page.Id, "MissingMetaTitle", "Page is missing a meta title"));
            if (string.IsNullOrWhiteSpace(page.MetaDescription))
                issues.Add(new SeoIssueDto(page.Title, page.Slug, page.Id, "MissingMetaDescription", "Page is missing a meta description"));
            if (string.IsNullOrWhiteSpace(page.OgImageUrl))
                issues.Add(new SeoIssueDto(page.Title, page.Slug, page.Id, "MissingOgImage", "Page is missing an Open Graph image"));
        }

        // Check for image elements missing alt text
        var imageElements = await _db.Set<Domain.Entities.Website.PageElement>()
            .Where(e => e.PhotographerId == photographerId.Value
                && e.Page.WebsiteId == request.WebsiteId
                && e.ElementType == Domain.Enums.ElementType.Image
                && (e.ContentJson == null || !e.ContentJson.Contains("\"altText\"")))
            .Select(e => new { e.Page.Title, e.Page.Slug, e.Id })
            .ToListAsync(ct);

        foreach (var img in imageElements)
        {
            issues.Add(new SeoIssueDto(img.Title, img.Slug, null, "MissingAltText",
                $"Image element {img.Id} is missing alt text"));
        }

        return Result<SeoAuditResultDto>.Success(new SeoAuditResultDto(request.WebsiteId, issues));
    }
}
