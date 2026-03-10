using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigureGoogleAnalyticsCommandHandler : IRequestHandler<ConfigureGoogleAnalyticsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConfigureGoogleAnalyticsCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigureGoogleAnalyticsCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result.NotFound("Photographer not found.");

        photographer.GoogleAnalyticsId = request.MeasurementId;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
