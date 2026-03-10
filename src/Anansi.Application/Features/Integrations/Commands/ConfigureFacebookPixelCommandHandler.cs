using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigureFacebookPixelCommandHandler : IRequestHandler<ConfigureFacebookPixelCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConfigureFacebookPixelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigureFacebookPixelCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result.NotFound("Photographer not found.");

        photographer.FacebookPixelId = request.PixelId;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
