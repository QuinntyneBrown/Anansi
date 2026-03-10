using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Finance;

/// <summary>
/// Apply for business financing (CAP-4.11.1).
/// </summary>
public record ApplyForFinancingCommand(long RequestedAmountCents) : IRequest<Result<FinancingApplicationDto>>;

public class ApplyForFinancingValidator : AbstractValidator<ApplyForFinancingCommand>
{
    public ApplyForFinancingValidator() { RuleFor(x => x.RequestedAmountCents).GreaterThan(0); }
}

public class ApplyForFinancingHandler : IRequestHandler<ApplyForFinancingCommand, Result<FinancingApplicationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApplyForFinancingHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<FinancingApplicationDto>> Handle(ApplyForFinancingCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var app = new FinancingApplication
        {
            PhotographerId = photographerId,
            RequestedAmountCents = request.RequestedAmountCents
        };

        _db.Set<FinancingApplication>().Add(app);
        await _db.SaveChangesAsync(ct);

        return Result<FinancingApplicationDto>.Success(new FinancingApplicationDto(
            app.Id, app.RequestedAmountCents, app.OfferedAmountCents, app.FlatFeeCents,
            app.RepaymentPercentage, app.RepaidCents, app.Status,
            app.ApprovedAt, app.FundedAt, app.RepaidAt, app.CreatedAt));
    }
}

/// <summary>
/// Get financing application status (CAP-4.11.2).
/// </summary>
public record GetFinancingApplicationQuery(Guid Id) : IRequest<Result<FinancingApplicationDto>>;

public class GetFinancingApplicationHandler : IRequestHandler<GetFinancingApplicationQuery, Result<FinancingApplicationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetFinancingApplicationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<FinancingApplicationDto>> Handle(GetFinancingApplicationQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var app = await _db.Set<FinancingApplication>()
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.PhotographerId == photographerId, ct);

        if (app is null) return Result<FinancingApplicationDto>.NotFound("Financing application not found");

        return Result<FinancingApplicationDto>.Success(new FinancingApplicationDto(
            app.Id, app.RequestedAmountCents, app.OfferedAmountCents, app.FlatFeeCents,
            app.RepaymentPercentage, app.RepaidCents, app.Status,
            app.ApprovedAt, app.FundedAt, app.RepaidAt, app.CreatedAt));
    }
}
