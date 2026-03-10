using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Queries;

public class GetLabPricingQueryHandler : IRequestHandler<GetLabPricingQuery, Result<IReadOnlyList<LabProductDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLabPricingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<LabProductDto>>> Handle(GetLabPricingQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.LabProducts
            .Where(p => p.LabName == request.LabName && p.IsAvailable)
            .Select(p => new LabProductDto(
                p.Id,
                p.LabName,
                p.ProductName,
                p.Category,
                p.Size,
                p.LabCostCents,
                p.PriceLastUpdated))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<LabProductDto>>.Success(products);
    }
}
