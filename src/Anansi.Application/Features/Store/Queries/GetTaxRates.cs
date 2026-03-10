using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetTaxRatesQuery : IRequest<Result<List<TaxRateDto>>>;

public class GetTaxRatesHandler : IRequestHandler<GetTaxRatesQuery, Result<List<TaxRateDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTaxRatesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<TaxRateDto>>> Handle(GetTaxRatesQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<TaxRateDto>>.Forbidden();

        var rates = await _db.TaxRates
            .Where(t => t.PhotographerId == _currentUser.PhotographerId)
            .OrderBy(t => t.Region)
            .ToListAsync(ct);

        return Result<List<TaxRateDto>>.Success(rates.Select(t =>
            new TaxRateDto(t.Id, t.Name, t.Region, t.Percentage, t.IsActive)).ToList());
    }
}
