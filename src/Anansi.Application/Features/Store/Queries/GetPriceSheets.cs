using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetPriceSheetsQuery : IRequest<Result<List<PriceSheetDto>>>;

public class GetPriceSheetsHandler : IRequestHandler<GetPriceSheetsQuery, Result<List<PriceSheetDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPriceSheetsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<PriceSheetDto>>> Handle(GetPriceSheetsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<PriceSheetDto>>.Forbidden();

        var sheets = await _db.PriceSheets
            .Include(ps => ps.Items)
                .ThenInclude(i => i.ProductVariation)
            .Where(ps => ps.PhotographerId == _currentUser.PhotographerId)
            .OrderByDescending(ps => ps.CreatedAt)
            .ToListAsync(ct);

        var dtos = sheets.Select(ps => new PriceSheetDto(
            ps.Id, ps.Name, ps.Description, ps.IsDownloadOnly, ps.IsDefault,
            ps.Items.Select(i => new PriceSheetItemDto(
                i.Id, i.ProductVariationId, i.ProductVariation?.Name ?? string.Empty, i.PriceCents)).ToList(),
            ps.CreatedAt, ps.UpdatedAt)).ToList();

        return Result<List<PriceSheetDto>>.Success(dtos);
    }
}
