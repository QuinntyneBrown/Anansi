using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Queries;

public class GetServiceAreaQueryHandler : IRequestHandler<GetServiceAreaQuery, Result<ServiceAreaDto?>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetServiceAreaQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ServiceAreaDto?>> Handle(GetServiceAreaQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<ServiceAreaDto?>.Failure("Not authenticated.", 401);

        var photographerId = _currentUser.PhotographerId.Value;

        var serviceArea = await _context.PhotographerServiceAreas
            .FirstOrDefaultAsync(sa => sa.PhotographerId == photographerId, cancellationToken);

        if (serviceArea == null)
            return Result<ServiceAreaDto?>.Success(null);

        return Result<ServiceAreaDto?>.Success(new ServiceAreaDto(
            serviceArea.Neighborhood,
            serviceArea.Latitude,
            serviceArea.Longitude,
            serviceArea.RadiusKm));
    }
}
