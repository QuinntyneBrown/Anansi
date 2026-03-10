using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Features.Presets.Commands;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Queries;

public record GetFavoritePresetsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedList<EditingPresetSummaryDto>>>;

public class GetFavoritePresetsHandler : IRequestHandler<GetFavoritePresetsQuery, Result<PagedList<EditingPresetSummaryDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetFavoritePresetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<EditingPresetSummaryDto>>> Handle(GetFavoritePresetsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<EditingPresetSummaryDto>>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;

        var favoritesQuery = _db.PresetFavorites
            .Where(f => f.PhotographerId == photographerId)
            .Join(
                _db.EditingPresets,
                f => f.PresetId,
                p => p.Id,
                (f, p) => p);

        var total = await favoritesQuery.CountAsync(ct);

        var presets = await favoritesQuery
            .OrderByDescending(p => p.FavoriteCount)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var dtos = presets
            .Select(p => CreateEditingPresetHandler.MapToSummaryDto(p, true))
            .ToList();

        return Result<PagedList<EditingPresetSummaryDto>>.Success(
            new PagedList<EditingPresetSummaryDto>(dtos, total, query.Page, query.PageSize));
    }
}
