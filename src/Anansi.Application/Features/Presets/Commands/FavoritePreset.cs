using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Presets;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Commands;

public record FavoritePresetCommand(Guid PresetId) : IRequest<Result>;

public class FavoritePresetHandler : IRequestHandler<FavoritePresetCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public FavoritePresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(FavoritePresetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden();

        var presetExists = await _db.EditingPresets
            .AnyAsync(p => p.Id == cmd.PresetId, ct);

        if (!presetExists)
            return Result.NotFound("Preset not found");

        var alreadyFavorited = await _db.PresetFavorites
            .AnyAsync(f => f.PresetId == cmd.PresetId && f.PhotographerId == _currentUser.PhotographerId, ct);

        if (alreadyFavorited)
            return Result.Success();

        _db.PresetFavorites.Add(new PresetFavorite
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            PresetId = cmd.PresetId
        });

        var preset = await _db.EditingPresets.FirstAsync(p => p.Id == cmd.PresetId, ct);
        preset.FavoriteCount++;

        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
