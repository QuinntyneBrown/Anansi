using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sharing;

// GAL-1.7.3: Revoke Quick Share
public record RevokeQuickShareLinkCommand(Guid Id) : IRequest<Result>;

public class RevokeQuickShareLinkHandler : IRequestHandler<RevokeQuickShareLinkCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RevokeQuickShareLinkHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(RevokeQuickShareLinkCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Forbidden("Not authenticated");

        var link = await _db.QuickShareLinks
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (link is null)
            return Result.NotFound("Quick share link not found");

        link.IsRevoked = true;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
