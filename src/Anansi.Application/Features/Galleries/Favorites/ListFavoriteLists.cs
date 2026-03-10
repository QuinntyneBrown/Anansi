using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.6: Favorite Activity Dashboard
public record ListFavoriteListsQuery(
    Guid? CollectionId = null,
    int Page = 1,
    int PageSize = 50
) : IRequest<Result<PagedList<FavoriteListDto>>>;

public class ListFavoriteListsHandler : IRequestHandler<ListFavoriteListsQuery, Result<PagedList<FavoriteListDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListFavoriteListsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<FavoriteListDto>>> Handle(ListFavoriteListsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<FavoriteListDto>>.Forbidden("Not authenticated");

        var query = _db.FavoriteLists
            .Where(f => f.PhotographerId == _currentUser.PhotographerId.Value);

        if (request.CollectionId.HasValue)
            query = query.Where(f => f.CollectionId == request.CollectionId.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(f => f.UpdatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FavoriteListDto(
                f.Id, f.CollectionId, f.Name,
                f.ClientName, f.ClientEmail,
                f.IsPreset, f.IsCompleted,
                f.ShareToken, f.Items.Count,
                f.CreatedAt, f.UpdatedAt
            ))
            .ToListAsync(ct);

        return Result<PagedList<FavoriteListDto>>.Success(
            new PagedList<FavoriteListDto>(items, totalCount, request.Page, request.PageSize));
    }
}
