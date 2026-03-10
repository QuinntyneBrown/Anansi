using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Commands;

/// <summary>
/// Creates a subscription for a photographer (PLN-10.1.1, PLN-10.1.2).
/// </summary>
public record CreateSubscriptionCommand(CreateSubscriptionRequest Request) : IRequest<Result<SubscriptionDto>>;

public class CreateSubscriptionValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionValidator()
    {
        RuleFor(x => x.Request.PlanId).NotEmpty();
        RuleFor(x => x.Request.BillingInterval).IsInEnum();
    }
}

public class CreateSubscriptionHandler : IRequestHandler<CreateSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSubscriptionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<SubscriptionDto>> Handle(CreateSubscriptionCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<SubscriptionDto>.Forbidden();

        var plan = await _db.Plans
            .FirstOrDefaultAsync(p => p.Id == cmd.Request.PlanId && p.IsActive, ct);
        if (plan is null)
            return Result<SubscriptionDto>.NotFound("Plan not found");

        // Free tier: no credit card required (PLN-10.1.1)
        var priceCents = cmd.Request.BillingInterval == BillingInterval.Monthly
            ? plan.MonthlyPriceCents
            : plan.AnnualPriceCents;

        var now = DateTime.UtcNow;
        var periodEnd = cmd.Request.BillingInterval == BillingInterval.Monthly
            ? now.AddMonths(1)
            : now.AddYears(1);

        var subscription = new Subscription
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            PlanId = plan.Id,
            BillingInterval = cmd.Request.BillingInterval,
            Status = SubscriptionStatus.Active,
            CurrentPeriodStart = now,
            CurrentPeriodEnd = periodEnd,
            PriceCents = priceCents
        };

        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync(ct);

        return Result<SubscriptionDto>.Success(new SubscriptionDto(
            subscription.Id, plan.Id, plan.Name, plan.Product, plan.Tier,
            subscription.BillingInterval, subscription.Status,
            subscription.CurrentPeriodStart, subscription.CurrentPeriodEnd,
            subscription.PriceCents, subscription.ProrationCreditCents,
            subscription.CancelledAt, subscription.CancelAtPeriodEnd,
            subscription.CreatedAt));
    }
}
