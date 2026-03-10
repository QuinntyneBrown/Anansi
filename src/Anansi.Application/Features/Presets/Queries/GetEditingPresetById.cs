using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Features.Presets.Commands;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Queries;

public record GetEditingPresetByIdQuery(Guid PresetId) : IRequest<Result<EditingPresetDto>>;

public class GetEditingPresetByIdHandler : IRequestHandler<GetEditingPresetByIdQuery, Result<EditingPresetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetEditingPresetByIdHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EditingPresetDto>> Handle(GetEditingPresetByIdQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<EditingPresetDto>.Forbidden();

        var preset = await _db.EditingPresets
            .FirstOrDefaultAsync(p => p.Id == query.PresetId, ct);

        if (preset is null)
            return Result<EditingPresetDto>.NotFound("Preset not found");

        // Only allow access to public, system, or own presets
        if (!preset.IsPublic && !preset.IsSystemPreset && preset.PhotographerId != _currentUser.PhotographerId)
            return Result<EditingPresetDto>.NotFound("Preset not found");

        var isFavorited = await _db.PresetFavorites
            .AnyAsync(f => f.PresetId == preset.Id && f.PhotographerId == _currentUser.PhotographerId, ct);

        return Result<EditingPresetDto>.Success(CreateEditingPresetHandler.MapToDto(preset, isFavorited));
    }
}
