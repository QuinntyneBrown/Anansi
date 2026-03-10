using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

// GAL-1.2.1: Move photos between sets
public record MoveMediaCommand(
    Guid MediaId,
    Guid? TargetSetId
) : IRequest<Result>;

public class MoveMediaHandler : IRequestHandler<MoveMediaCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MoveMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(MoveMediaCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var media = await _db.GalleryMedia
            .FirstOrDefaultAsync(m => m.Id == request.MediaId && m.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (media is null)
            return Result.NotFound("Media not found");

        if (request.TargetSetId.HasValue)
        {
            var setExists = await _db.CollectionSets.AnyAsync(
                s => s.Id == request.TargetSetId.Value && s.CollectionId == media.CollectionId, ct);
            if (!setExists)
                return Result.NotFound("Target set not found");
        }

        media.SetId = request.TargetSetId;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
