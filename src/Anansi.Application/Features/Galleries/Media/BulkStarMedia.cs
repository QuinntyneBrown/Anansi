using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

// GAL-1.2.3: Bulk starring
public record BulkStarMediaCommand(
    List<Guid> MediaIds,
    bool Star
) : IRequest<Result>;

public class BulkStarMediaHandler : IRequestHandler<BulkStarMediaCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public BulkStarMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(BulkStarMediaCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var media = await _db.GalleryMedia
            .Where(m => request.MediaIds.Contains(m.Id) && m.PhotographerId == _currentUser.PhotographerId.Value)
            .ToListAsync(ct);

        foreach (var m in media)
            m.IsStarred = request.Star;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
