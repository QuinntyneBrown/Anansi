using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Queries;

/// <summary>
/// Checks whether a feature is available under the current plan (PLN-10.2.1 through PLN-10.2.4).
/// </summary>
public record CheckFeatureAccessQuery(string FeatureKey) : IRequest<Result<FeatureCheckResult>>;

public class CheckFeatureAccessHandler : IRequestHandler<CheckFeatureAccessQuery, Result<FeatureCheckResult>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CheckFeatureAccessHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<FeatureCheckResult>> Handle(CheckFeatureAccessQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<FeatureCheckResult>.Forbidden();

        // Find active subscription
        var subscription = await _db.Subscriptions
            .Include(s => s.Plan)
                .ThenInclude(p => p.FeatureGates)
            .FirstOrDefaultAsync(s => s.PhotographerId == _currentUser.PhotographerId
                && s.Status == SubscriptionStatus.Active, ct);

        if (subscription is null)
        {
            // No active subscription = Free tier. Look up free plan gates.
            var freePlan = await _db.Plans
                .Include(p => p.FeatureGates)
                .FirstOrDefaultAsync(p => p.Tier == PlanTier.Free && p.IsActive, ct);

            if (freePlan is null)
                return Result<FeatureCheckResult>.Success(
                    new FeatureCheckResult(query.FeatureKey, false, null, "No plan found"));

            var freeGate = freePlan.FeatureGates
                .FirstOrDefault(fg => fg.FeatureKey == query.FeatureKey);

            return Result<FeatureCheckResult>.Success(new FeatureCheckResult(
                query.FeatureKey,
                freeGate is not null && freeGate.FeatureValue != "false" && freeGate.FeatureValue != "0",
                freeGate?.FeatureValue,
                freeGate is null ? "Feature not defined for Free plan" : null));
        }

        var gate = subscription.Plan.FeatureGates
            .FirstOrDefault(fg => fg.FeatureKey == query.FeatureKey);

        if (gate is null)
            return Result<FeatureCheckResult>.Success(
                new FeatureCheckResult(query.FeatureKey, false, null, "Feature not defined for current plan"));

        var isAllowed = gate.FeatureValue != "false" && gate.FeatureValue != "0";

        return Result<FeatureCheckResult>.Success(
            new FeatureCheckResult(query.FeatureKey, isAllowed, gate.FeatureValue, null));
    }
}
