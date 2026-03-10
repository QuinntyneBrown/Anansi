using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Commands;

public record DeleteEditingPresetCommand(Guid PresetId) : IRequest<Result>;

public class DeleteEditingPresetHandler : IRequestHandler<DeleteEditingPresetCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteEditingPresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteEditingPresetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden();

        var preset = await _db.EditingPresets
            .FirstOrDefaultAsync(p => p.Id == cmd.PresetId, ct);

        if (preset is null)
            return Result.NotFound("Preset not found");

        if (preset.IsSystemPreset)
            return Result.Failure("System presets cannot be deleted", 403);

        if (preset.PhotographerId != _currentUser.PhotographerId)
            return Result.Forbidden("You can only delete your own presets");

        preset.IsDeleted = true;
        preset.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
