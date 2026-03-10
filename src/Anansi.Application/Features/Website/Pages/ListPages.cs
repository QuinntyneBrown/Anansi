using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Pages;

public record ListPagesQuery(Guid WebsiteId) : IRequest<Result<List<WebsitePageDto>>>;

public class ListPagesHandler : IRequestHandler<ListPagesQuery, Result<List<WebsitePageDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListPagesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<WebsitePageDto>>> Handle(ListPagesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<WebsitePageDto>>.Failure("Not authenticated", 401);

        var pages = await _db.Set<Domain.Entities.Website.WebsitePage>()
            .Where(p => p.WebsiteId == request.WebsiteId && p.PhotographerId == photographerId.Value)
            .OrderBy(p => p.SortOrder)
            .Select(p => new WebsitePageDto(
                p.Id, p.WebsiteId, p.Title, p.Slug, p.PageType, p.SortOrder,
                p.IsVisible, p.ShowInNavigation, p.PagePasswordHash != null,
                p.MetaTitle, p.MetaDescription, p.OgImageUrl, p.CreatedAt, p.UpdatedAt))
            .ToListAsync(ct);

        return Result<List<WebsitePageDto>>.Success(pages);
    }
}
