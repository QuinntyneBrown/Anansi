using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Favorites;

// GAL-1.5.5: Favorite List Actions, GAL-1.5.6: Notification when complete
public record CompleteFavoriteListCommand(Guid FavoriteListId) : IRequest<Result>;

public class CompleteFavoriteListHandler : IRequestHandler<CompleteFavoriteListCommand, Result>
{
    private readonly IApplicationDbContext _db;

    public CompleteFavoriteListHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result> Handle(CompleteFavoriteListCommand request, CancellationToken ct)
    {
        var favoriteList = await _db.FavoriteLists
            .FirstOrDefaultAsync(f => f.Id == request.FavoriteListId, ct);

        if (favoriteList is null)
            return Result.NotFound("Favorite list not found");

        favoriteList.IsCompleted = true;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
