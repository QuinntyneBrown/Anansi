using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Presets;

public record ListPresetsQuery : IRequest<Result<List<CollectionPresetDto>>>;

public class ListPresetsHandler : IRequestHandler<ListPresetsQuery, Result<List<CollectionPresetDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListPresetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CollectionPresetDto>>> Handle(ListPresetsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<CollectionPresetDto>>.Forbidden("Not authenticated");

        var presets = await _db.CollectionPresets
            .Where(p => p.PhotographerId == _currentUser.PhotographerId.Value)
            .OrderBy(p => p.Name)
            .Select(p => new CollectionPresetDto(
                p.Id, p.Name, p.CoverStyle, p.Theme, p.FontFamily, p.ColorPalette, p.CustomColorHex,
                p.Layout, p.DownloadsEnabled, p.DownloadPinEnabled, p.AllowedResolutions,
                p.RequireEmailRegistration, p.Language, p.CreatedAt, p.UpdatedAt
            ))
            .ToListAsync(ct);

        return Result<List<CollectionPresetDto>>.Success(presets);
    }
}
