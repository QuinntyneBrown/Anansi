using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

// GAL-1.2.3: Star/Bookmark
public record ToggleStarCollectionCommand(Guid Id) : IRequest<Result<bool>>;

public class ToggleStarCollectionHandler : IRequestHandler<ToggleStarCollectionCommand, Result<bool>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ToggleStarCollectionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(ToggleStarCollectionCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<bool>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<bool>.NotFound("Collection not found");

        collection.IsStarred = !collection.IsStarred;
        await _db.SaveChangesAsync(ct);

        return Result<bool>.Success(collection.IsStarred);
    }
}
