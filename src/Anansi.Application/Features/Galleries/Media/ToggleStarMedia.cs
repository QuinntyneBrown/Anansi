using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

// GAL-1.2.3: Star individual photos
public record ToggleStarMediaCommand(Guid MediaId) : IRequest<Result<bool>>;

public class ToggleStarMediaHandler : IRequestHandler<ToggleStarMediaCommand, Result<bool>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ToggleStarMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(ToggleStarMediaCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<bool>.Forbidden("Not authenticated");

        var media = await _db.GalleryMedia
            .FirstOrDefaultAsync(m => m.Id == request.MediaId && m.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (media is null)
            return Result<bool>.NotFound("Media not found");

        media.IsStarred = !media.IsStarred;
        await _db.SaveChangesAsync(ct);

        return Result<bool>.Success(media.IsStarred);
    }
}
