using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Commands;

public record UnfavoritePresetCommand(Guid PresetId) : IRequest<Result>;

public class UnfavoritePresetHandler : IRequestHandler<UnfavoritePresetCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UnfavoritePresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UnfavoritePresetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden();

        var favorite = await _db.PresetFavorites
            .FirstOrDefaultAsync(f => f.PresetId == cmd.PresetId && f.PhotographerId == _currentUser.PhotographerId, ct);

        if (favorite is null)
            return Result.Success();

        _db.PresetFavorites.Remove(favorite);

        var preset = await _db.EditingPresets.FirstOrDefaultAsync(p => p.Id == cmd.PresetId, ct);
        if (preset is not null && preset.FavoriteCount > 0)
            preset.FavoriteCount--;

        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
