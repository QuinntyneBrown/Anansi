using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Typography;

/// <summary>
/// WEB-3.4.2 - Color System: 40+ palettes with 200+ combinations, custom hex.
/// </summary>
public record ListColorPalettesQuery : IRequest<Result<List<ColorPaletteDto>>>;

public class ListColorPalettesHandler : IRequestHandler<ListColorPalettesQuery, Result<List<ColorPaletteDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListColorPalettesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ColorPaletteDto>>> Handle(ListColorPalettesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;

        var palettes = await _db.Set<Domain.Entities.Website.ColorPalette>()
            .Where(p => p.IsSystem || p.PhotographerId == photographerId)
            .OrderBy(p => p.SortOrder)
            .Select(p => new ColorPaletteDto(p.Id, p.Name, p.ColorsJson, p.IsSystem, p.SortOrder))
            .ToListAsync(ct);

        return Result<List<ColorPaletteDto>>.Success(palettes);
    }
}

public record CreateCustomColorPaletteCommand(string Name, string ColorsJson) : IRequest<Result<ColorPaletteDto>>;

public class CreateCustomColorPaletteHandler : IRequestHandler<CreateCustomColorPaletteCommand, Result<ColorPaletteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCustomColorPaletteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ColorPaletteDto>> Handle(CreateCustomColorPaletteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<ColorPaletteDto>.Failure("Not authenticated", 401);

        var maxOrder = await _db.Set<Domain.Entities.Website.ColorPalette>()
            .Where(p => p.PhotographerId == photographerId.Value)
            .MaxAsync(p => (int?)p.SortOrder, ct) ?? 0;

        var palette = new Domain.Entities.Website.ColorPalette
        {
            Name = request.Name,
            ColorsJson = request.ColorsJson,
            IsSystem = false,
            PhotographerId = photographerId.Value,
            SortOrder = maxOrder + 1
        };

        _db.Set<Domain.Entities.Website.ColorPalette>().Add(palette);
        await _db.SaveChangesAsync(ct);

        return Result<ColorPaletteDto>.Success(new ColorPaletteDto(
            palette.Id, palette.Name, palette.ColorsJson, palette.IsSystem, palette.SortOrder));
    }
}
