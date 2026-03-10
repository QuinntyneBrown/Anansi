using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Queries;

/// <summary>
/// Lists available plans by product area (PLN-10.1.1, PLN-10.1.2, PLN-10.1.3).
/// </summary>
public record GetPlansQuery(PlanProduct? Product = null) : IRequest<Result<List<PlanDto>>>;

public class GetPlansHandler : IRequestHandler<GetPlansQuery, Result<List<PlanDto>>>
{
    private readonly IApplicationDbContext _db;

    public GetPlansHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<List<PlanDto>>> Handle(GetPlansQuery query, CancellationToken ct)
    {
        var q = _db.Plans
            .Include(p => p.FeatureGates)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (query.Product.HasValue)
            q = q.Where(p => p.Product == query.Product);

        var plans = await q
            .OrderBy(p => p.Product)
            .ThenBy(p => p.Tier)
            .ToListAsync(ct);

        return Result<List<PlanDto>>.Success(plans.Select(p => new PlanDto(
            p.Id, p.Product, p.Tier, p.Name, p.Description,
            p.MonthlyPriceCents, p.AnnualPriceCents,
            p.IsSuiteBundle, p.IsActive,
            p.FeatureGates.Select(fg => new PlanFeatureGateDto(
                fg.Id, fg.FeatureKey, fg.FeatureValue, fg.Description)).ToList())).ToList());
    }
}
