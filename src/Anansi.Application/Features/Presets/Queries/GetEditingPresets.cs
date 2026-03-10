using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Features.Presets.Commands;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Queries;

public record GetEditingPresetsQuery(
    SkinToneRange? SkinToneRange,
    ShootingContext? ShootingContext,
    bool? IsSystem,
    int Page = 1,
    int PageSize = 20) : IRequest<Result<PagedList<EditingPresetSummaryDto>>>;

public class GetEditingPresetsHandler : IRequestHandler<GetEditingPresetsQuery, Result<PagedList<EditingPresetSummaryDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetEditingPresetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<EditingPresetSummaryDto>>> Handle(GetEditingPresetsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<EditingPresetSummaryDto>>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;

        // Return public presets + own private presets
        var q = _db.EditingPresets
            .Where(p => p.IsPublic || p.IsSystemPreset || p.PhotographerId == photographerId)
            .AsQueryable();

        if (query.SkinToneRange.HasValue)
            q = q.Where(p => p.SkinToneRange == query.SkinToneRange);

        if (query.ShootingContext.HasValue)
            q = q.Where(p => p.ShootingContext == query.ShootingContext);

        if (query.IsSystem.HasValue)
            q = q.Where(p => p.IsSystemPreset == query.IsSystem.Value);

        var total = await q.CountAsync(ct);

        var presets = await q
            .OrderByDescending(p => p.FavoriteCount)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var presetIds = presets.Select(p => p.Id).ToList();
        var favoritedIds = await _db.PresetFavorites
            .Where(f => f.PhotographerId == photographerId && presetIds.Contains(f.PresetId))
            .Select(f => f.PresetId)
            .ToListAsync(ct);

        var favoritedSet = new HashSet<Guid>(favoritedIds);

        var dtos = presets
            .Select(p => CreateEditingPresetHandler.MapToSummaryDto(p, favoritedSet.Contains(p.Id)))
            .ToList();

        return Result<PagedList<EditingPresetSummaryDto>>.Success(
            new PagedList<EditingPresetSummaryDto>(dtos, total, query.Page, query.PageSize));
    }
}
