using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetShippingMethodsQuery : IRequest<Result<List<ShippingMethodDto>>>;

public class GetShippingMethodsHandler : IRequestHandler<GetShippingMethodsQuery, Result<List<ShippingMethodDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetShippingMethodsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ShippingMethodDto>>> Handle(GetShippingMethodsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<ShippingMethodDto>>.Forbidden();

        var methods = await _db.ShippingMethods
            .Where(sm => sm.PhotographerId == _currentUser.PhotographerId)
            .OrderBy(sm => sm.Name)
            .ToListAsync(ct);

        return Result<List<ShippingMethodDto>>.Success(methods.Select(sm =>
            new ShippingMethodDto(sm.Id, sm.Name, sm.Description,
                sm.CostCents, sm.EstimatedDelivery, sm.IsActive)).ToList());
    }
}
