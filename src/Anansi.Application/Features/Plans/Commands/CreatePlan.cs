using Anansi.Application.Common;
using Anansi.Application.DTOs.Plans;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Billing;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Plans.Commands;

/// <summary>
/// Creates a plan definition (PLN-10.1.1, PLN-10.1.2, PLN-10.1.3).
/// </summary>
public record CreatePlanCommand(CreatePlanRequest Request) : IRequest<Result<PlanDto>>;

public class CreatePlanValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.Product).IsInEnum();
        RuleFor(x => x.Request.Tier).IsInEnum();
        RuleFor(x => x.Request.MonthlyPriceCents).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Request.AnnualPriceCents).GreaterThanOrEqualTo(0);
        // Annual must be at least 15% discount (PLN-10.1.2)
        RuleFor(x => x.Request)
            .Must(r => r.MonthlyPriceCents == 0 || r.AnnualPriceCents <= (long)(r.MonthlyPriceCents * 12 * 0.85m))
            .WithMessage("Annual price must offer at least 15% discount over monthly rate")
            .When(x => x.Request.MonthlyPriceCents > 0);
    }
}

public class CreatePlanHandler : IRequestHandler<CreatePlanCommand, Result<PlanDto>>
{
    private readonly IApplicationDbContext _db;

    public CreatePlanHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<PlanDto>> Handle(CreatePlanCommand cmd, CancellationToken ct)
    {
        var req = cmd.Request;
        var plan = new Plan
        {
            Product = req.Product,
            Tier = req.Tier,
            Name = req.Name,
            Description = req.Description,
            MonthlyPriceCents = req.MonthlyPriceCents,
            AnnualPriceCents = req.AnnualPriceCents,
            IsSuiteBundle = req.IsSuiteBundle
        };

        if (req.FeatureGates is { Count: > 0 })
        {
            foreach (var fg in req.FeatureGates)
            {
                plan.FeatureGates.Add(new PlanFeatureGate
                {
                    FeatureKey = fg.FeatureKey,
                    FeatureValue = fg.FeatureValue,
                    Description = fg.Description
                });
            }
        }

        _db.Plans.Add(plan);
        await _db.SaveChangesAsync(ct);

        return Result<PlanDto>.Success(MapToDto(plan));
    }

    private static PlanDto MapToDto(Plan p) => new(
        p.Id, p.Product, p.Tier, p.Name, p.Description,
        p.MonthlyPriceCents, p.AnnualPriceCents,
        p.IsSuiteBundle, p.IsActive,
        p.FeatureGates.Select(fg => new PlanFeatureGateDto(
            fg.Id, fg.FeatureKey, fg.FeatureValue, fg.Description)).ToList());
}
