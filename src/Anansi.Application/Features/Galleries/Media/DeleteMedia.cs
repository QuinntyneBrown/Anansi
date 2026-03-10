using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

public record DeleteMediaCommand(Guid Id) : IRequest<Result>;

public class DeleteMediaHandler : IRequestHandler<DeleteMediaCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IStorageService _storage;

    public DeleteMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser, IStorageService storage)
    {
        _db = db;
        _currentUser = currentUser;
        _storage = storage;
    }

    public async Task<Result> Handle(DeleteMediaCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var media = await _db.GalleryMedia
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (media is null)
            return Result.NotFound("Media not found");

        media.IsDeleted = true;
        media.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
