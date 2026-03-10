using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigurePayPalCommandHandler : IRequestHandler<ConfigurePayPalCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConfigurePayPalCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigurePayPalCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result.NotFound("Photographer not found.");

        photographer.PayPalEmail = request.PayPalEmail;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
