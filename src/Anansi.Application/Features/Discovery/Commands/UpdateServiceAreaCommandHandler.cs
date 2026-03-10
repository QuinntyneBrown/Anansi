using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Discovery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Commands;

public class UpdateServiceAreaCommandHandler : IRequestHandler<UpdateServiceAreaCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateServiceAreaCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateServiceAreaCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographerId = _currentUser.PhotographerId.Value;

        var serviceArea = await _context.PhotographerServiceAreas
            .FirstOrDefaultAsync(sa => sa.PhotographerId == photographerId, cancellationToken);

        if (serviceArea == null)
        {
            serviceArea = new PhotographerServiceArea
            {
                PhotographerId = photographerId,
                Neighborhood = request.Neighborhood.Trim(),
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                RadiusKm = request.RadiusKm
            };
            _context.PhotographerServiceAreas.Add(serviceArea);
        }
        else
        {
            serviceArea.Neighborhood = request.Neighborhood.Trim();
            serviceArea.Latitude = request.Latitude;
            serviceArea.Longitude = request.Longitude;
            serviceArea.RadiusKm = request.RadiusKm;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
