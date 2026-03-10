using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Commands;

public record CancelSubscriptionCommand(bool Immediate = false) : IRequest<Result>;

public class CancelSubscriptionHandler : IRequestHandler<CancelSubscriptionCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CancelSubscriptionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(CancelSubscriptionCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result.Failure("Forbidden", 403);

        var subscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.PhotographerId == _currentUser.PhotographerId
                && s.Status == SubscriptionStatus.Active, ct);

        if (subscription is null)
            return Result.NotFound("No active subscription found");

        if (cmd.Immediate)
        {
            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.CancelledAt = DateTime.UtcNow;
        }
        else
        {
            subscription.CancelAtPeriodEnd = true;
        }

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
