using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.5: View favorites items
public record GetFavoriteListItemsQuery(Guid FavoriteListId) : IRequest<Result<List<FavoriteItemDto>>>;

public class GetFavoriteListItemsHandler : IRequestHandler<GetFavoriteListItemsQuery, Result<List<FavoriteItemDto>>>
{
    private readonly IApplicationDbContext _db;

    public GetFavoriteListItemsHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<List<FavoriteItemDto>>> Handle(GetFavoriteListItemsQuery request, CancellationToken ct)
    {
        var list = await _db.FavoriteLists
            .FirstOrDefaultAsync(f => f.Id == request.FavoriteListId, ct);

        if (list is null)
            return Result<List<FavoriteItemDto>>.NotFound("Favorite list not found");

        var items = await _db.FavoriteItems
            .Where(i => i.FavoriteListId == request.FavoriteListId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new FavoriteItemDto(
                i.Id, i.FavoriteListId, i.MediaId,
                i.Comment, i.Media.FileName, i.CreatedAt
            ))
            .ToListAsync(ct);

        return Result<List<FavoriteItemDto>>.Success(items);
    }
}
