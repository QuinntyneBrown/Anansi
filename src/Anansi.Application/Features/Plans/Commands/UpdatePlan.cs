using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Plans.Commands;

public record UpdatePlanCommand(Guid PlanId, UpdatePlanRequest Request) : IRequest<Result<PlanDto>>;

public class UpdatePlanValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.MonthlyPriceCents).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Request.AnnualPriceCents).GreaterThanOrEqualTo(0);
    }
}

public class UpdatePlanHandler : IRequestHandler<UpdatePlanCommand, Result<PlanDto>>
{
    private readonly IApplicationDbContext _db;

    public UpdatePlanHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<PlanDto>> Handle(UpdatePlanCommand cmd, CancellationToken ct)
    {
        var plan = await _db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == cmd.PlanId, ct);

        if (plan is null)
            return Result<PlanDto>.NotFound("Plan not found");

        plan.Name = cmd.Request.Name;
        plan.Description = cmd.Request.Description;
        plan.MonthlyPriceCents = cmd.Request.MonthlyPriceCents;
        plan.AnnualPriceCents = cmd.Request.AnnualPriceCents;
        plan.IsActive = cmd.Request.IsActive;

        await _db.SaveChangesAsync(ct);

        return Result<PlanDto>.Success(new PlanDto(
            plan.Id, plan.Product, plan.Tier, plan.Name, plan.Description,
            plan.MonthlyPriceCents, plan.AnnualPriceCents,
            plan.IsSuiteBundle, plan.IsActive,
            plan.FeatureGates.Select(fg => new PlanFeatureGateDto(
                fg.Id, fg.FeatureKey, fg.FeatureValue, fg.Description)).ToList()));
    }
}
