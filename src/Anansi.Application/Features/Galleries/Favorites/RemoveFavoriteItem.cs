using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.1: Remove from favorites
public record RemoveFavoriteItemCommand(Guid FavoriteItemId) : IRequest<Result>;

public class RemoveFavoriteItemHandler : IRequestHandler<RemoveFavoriteItemCommand, Result>
{
    private readonly IApplicationDbContext _db;

    public RemoveFavoriteItemHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(RemoveFavoriteItemCommand request, CancellationToken ct)
    {
        var item = await _db.FavoriteItems
            .FirstOrDefaultAsync(i => i.Id == request.FavoriteItemId, ct);

        if (item is null)
            return Result.NotFound("Favorite item not found");

        _db.FavoriteItems.Remove(item);
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
