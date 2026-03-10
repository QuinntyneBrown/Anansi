using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Commands;

/// <summary>
/// Upgrades or downgrades a subscription with proration (PLN-10.1.2).
/// </summary>
public record ChangeSubscriptionCommand(ChangeSubscriptionRequest Request) : IRequest<Result<SubscriptionDto>>;

public class ChangeSubscriptionValidator : AbstractValidator<ChangeSubscriptionCommand>
{
    public ChangeSubscriptionValidator()
    {
        RuleFor(x => x.Request.NewPlanId).NotEmpty();
        RuleFor(x => x.Request.BillingInterval).IsInEnum();
    }
}

public class ChangeSubscriptionHandler : IRequestHandler<ChangeSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ChangeSubscriptionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<SubscriptionDto>> Handle(ChangeSubscriptionCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<SubscriptionDto>.Forbidden();

        var existing = await _db.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.PhotographerId == _currentUser.PhotographerId
                && s.Status == SubscriptionStatus.Active, ct);

        if (existing is null)
            return Result<SubscriptionDto>.NotFound("No active subscription found");

        var newPlan = await _db.Plans
            .FirstOrDefaultAsync(p => p.Id == cmd.Request.NewPlanId && p.IsActive, ct);
        if (newPlan is null)
            return Result<SubscriptionDto>.NotFound("Plan not found");

        // Calculate proration credit (PLN-10.1.2)
        var now = DateTime.UtcNow;
        var totalPeriod = (existing.CurrentPeriodEnd - existing.CurrentPeriodStart).TotalDays;
        var remainingDays = (existing.CurrentPeriodEnd - now).TotalDays;
        var prorationCredit = totalPeriod > 0
            ? (long)(existing.PriceCents * (remainingDays / totalPeriod))
            : 0L;

        var newPrice = cmd.Request.BillingInterval == BillingInterval.Monthly
            ? newPlan.MonthlyPriceCents
            : newPlan.AnnualPriceCents;

        var periodEnd = cmd.Request.BillingInterval == BillingInterval.Monthly
            ? now.AddMonths(1)
            : now.AddYears(1);

        // Cancel old subscription
        existing.Status = SubscriptionStatus.Cancelled;
        existing.CancelledAt = now;

        // Create new subscription
        var newSub = new Domain.Entities.Billing.Subscription
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            PlanId = newPlan.Id,
            BillingInterval = cmd.Request.BillingInterval,
            Status = SubscriptionStatus.Active,
            CurrentPeriodStart = now,
            CurrentPeriodEnd = periodEnd,
            PriceCents = newPrice,
            ProrationCreditCents = prorationCredit
        };

        _db.Subscriptions.Add(newSub);
        await _db.SaveChangesAsync(ct);

        return Result<SubscriptionDto>.Success(new SubscriptionDto(
            newSub.Id, newPlan.Id, newPlan.Name, newPlan.Product, newPlan.Tier,
            newSub.BillingInterval, newSub.Status,
            newSub.CurrentPeriodStart, newSub.CurrentPeriodEnd,
            newSub.PriceCents, newSub.ProrationCreditCents,
            newSub.CancelledAt, newSub.CancelAtPeriodEnd,
            newSub.CreatedAt));
    }
}
