using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Queries;

public record GetCurrentSubscriptionQuery : IRequest<Result<SubscriptionDto>>;

public class GetCurrentSubscriptionHandler : IRequestHandler<GetCurrentSubscriptionQuery, Result<SubscriptionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentSubscriptionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<SubscriptionDto>> Handle(GetCurrentSubscriptionQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<SubscriptionDto>.Forbidden();

        var subscription = await _db.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.PhotographerId == _currentUser.PhotographerId
                && s.Status == SubscriptionStatus.Active, ct);

        if (subscription is null)
            return Result<SubscriptionDto>.NotFound("No active subscription");

        return Result<SubscriptionDto>.Success(new SubscriptionDto(
            subscription.Id, subscription.Plan.Id, subscription.Plan.Name,
            subscription.Plan.Product, subscription.Plan.Tier,
            subscription.BillingInterval, subscription.Status,
            subscription.CurrentPeriodStart, subscription.CurrentPeriodEnd,
            subscription.PriceCents, subscription.ProrationCreditCents,
            subscription.CancelledAt, subscription.CancelAtPeriodEnd,
            subscription.CreatedAt));
    }
}
