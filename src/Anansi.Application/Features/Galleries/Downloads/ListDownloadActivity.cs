using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Downloads;

// GAL-1.4.5: Download Activity Tracking
public record ListDownloadActivityQuery(
    Guid CollectionId,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 50
) : IRequest<Result<PagedList<GalleryActivityDto>>>;

public class ListDownloadActivityHandler : IRequestHandler<ListDownloadActivityQuery, Result<PagedList<GalleryActivityDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListDownloadActivityHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<GalleryActivityDto>>> Handle(ListDownloadActivityQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<GalleryActivityDto>>.Forbidden("Not authenticated");

        var query = _db.GalleryActivities
            .Where(a => a.CollectionId == request.CollectionId
                        && a.PhotographerId == _currentUser.PhotographerId.Value
                        && a.ActivityType == ActivityType.Download);

        if (request.From.HasValue)
            query = query.Where(a => a.CreatedAt >= request.From.Value);
        if (request.To.HasValue)
            query = query.Where(a => a.CreatedAt <= request.To.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new GalleryActivityDto(
                a.Id, a.CollectionId, a.ActivityType,
                a.ActorName, a.ActorEmail, a.MediaId, a.FavoriteListId,
                a.Details, a.Resolution, a.IsFullGallery, a.CreatedAt
            ))
            .ToListAsync(ct);

        return Result<PagedList<GalleryActivityDto>>.Success(
            new PagedList<GalleryActivityDto>(items, totalCount, request.Page, request.PageSize));
    }
}
