using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class RevokeApiKeyCommandHandler : IRequestHandler<RevokeApiKeyCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RevokeApiKeyCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(RevokeApiKeyCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var apiKey = await _context.ApiKeys
            .FirstOrDefaultAsync(k => k.Id == request.Id && k.PhotographerId == _currentUser.PhotographerId.Value, cancellationToken);

        if (apiKey == null)
            return Result.NotFound("API key not found.");

        apiKey.IsActive = false;
        apiKey.IsDeleted = true;
        apiKey.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
