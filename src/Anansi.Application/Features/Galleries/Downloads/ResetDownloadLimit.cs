using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Downloads;

// GAL-1.4.3: Reset/modify download limit
public record ResetDownloadLimitCommand(
    Guid CollectionId,
    int? NewLimit
) : IRequest<Result>;

public class ResetDownloadLimitHandler : IRequestHandler<ResetDownloadLimitCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ResetDownloadLimitHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ResetDownloadLimitCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result.NotFound("Collection not found");

        collection.DownloadLimit = request.NewLimit;
        collection.DownloadCount = 0;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
