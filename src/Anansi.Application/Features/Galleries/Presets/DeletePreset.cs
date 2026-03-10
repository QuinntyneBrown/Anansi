using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Presets;

public record DeletePresetCommand(Guid Id) : IRequest<Result>;

public class DeletePresetHandler : IRequestHandler<DeletePresetCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeletePresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeletePresetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var preset = await _db.CollectionPresets
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (preset is null)
            return Result.NotFound("Preset not found");

        preset.IsDeleted = true;
        preset.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
