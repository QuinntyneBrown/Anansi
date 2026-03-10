using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

public record ListMediaQuery(
    Guid CollectionId,
    Guid? SetId = null,
    bool? StarredOnly = null,
    int Page = 1,
    int PageSize = 50
) : IRequest<Result<PagedList<GalleryMediaDto>>>;

public class ListMediaHandler : IRequestHandler<ListMediaQuery, Result<PagedList<GalleryMediaDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<GalleryMediaDto>>> Handle(ListMediaQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<GalleryMediaDto>>.Forbidden("Not authenticated");

        var query = _db.GalleryMedia
            .Where(m => m.CollectionId == request.CollectionId && m.PhotographerId == _currentUser.PhotographerId.Value);

        if (request.SetId.HasValue)
            query = query.Where(m => m.SetId == request.SetId.Value);

        if (request.StarredOnly == true)
            query = query.Where(m => m.IsStarred);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(m => m.SortOrder)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new GalleryMediaDto(
                m.Id, m.CollectionId, m.SetId,
                m.FileName, m.OriginalFileName, m.MediaType, m.ContentType, m.FileSizeBytes,
                m.Width, m.Height, m.CameraMake, m.CameraModel, m.LensModel,
                m.FocalLength, m.Aperture, m.ShutterSpeed, m.Iso, m.DateTaken,
                m.Duration, m.VideoResolution,
                m.SortOrder, m.IsStarred, m.IsPrivate, m.CreatedAt
            ))
            .ToListAsync(ct);

        return Result<PagedList<GalleryMediaDto>>.Success(
            new PagedList<GalleryMediaDto>(items, totalCount, request.Page, request.PageSize));
    }
}
