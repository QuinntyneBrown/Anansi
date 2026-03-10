using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.5: Private Photos
public record TogglePrivatePhotoCommand(
    Guid MediaId,
    string? ClientName,
    string? ClientEmail
) : IRequest<Result<bool>>;

public class TogglePrivatePhotoHandler : IRequestHandler<TogglePrivatePhotoCommand, Result<bool>>
{
    private readonly IApplicationDbContext _db;

    public TogglePrivatePhotoHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<bool>> Handle(TogglePrivatePhotoCommand request, CancellationToken ct)
    {
        var media = await _db.GalleryMedia
            .FirstOrDefaultAsync(m => m.Id == request.MediaId, ct);

        if (media is null)
            return Result<bool>.NotFound("Media not found");

        media.IsPrivate = !media.IsPrivate;

        // Track activity
        var activity = new GalleryActivity
        {
            PhotographerId = media.PhotographerId,
            CollectionId = media.CollectionId,
            ActivityType = ActivityType.PrivatePhoto,
            ActorName = request.ClientName,
            ActorEmail = request.ClientEmail,
            MediaId = media.Id,
            Details = media.IsPrivate ? "Marked as private" : "Unmarked as private"
        };
        _db.GalleryActivities.Add(activity);

        await _db.SaveChangesAsync(ct);

        return Result<bool>.Success(media.IsPrivate);
    }
}
