using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Applies percentage markup to all variations of a product type (STR-2.3.2).
/// </summary>
public record ApplyBulkMarkupCommand(BulkMarkupRequest Request) : IRequest<Result<int>>;

public class ApplyBulkMarkupValidator : AbstractValidator<ApplyBulkMarkupCommand>
{
    public ApplyBulkMarkupValidator()
    {
        RuleFor(x => x.Request.ProductType).IsInEnum();
        RuleFor(x => x.Request.MarkupPercentage).GreaterThan(0);
    }
}

public class ApplyBulkMarkupHandler : IRequestHandler<ApplyBulkMarkupCommand, Result<int>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApplyBulkMarkupHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<int>> Handle(ApplyBulkMarkupCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<int>.Forbidden();

        var req = cmd.Request;
        var variations = await _db.ProductVariations
            .Include(v => v.Product)
            .Where(v => v.Product.PhotographerId == _currentUser.PhotographerId
                && v.Product.ProductType == req.ProductType
                && v.IsActive)
            .ToListAsync(ct);

        var count = 0;
        foreach (var v in variations)
        {
            // Skip custom-priced unless override is requested (STR-2.3.2)
            if (v.IsCustomPriced && !req.OverrideCustomPriced)
                continue;

            v.MarkupCents = (long)(v.CostCents * req.MarkupPercentage / 100m);
            v.PriceCents = v.CostCents + v.MarkupCents;
            count++;
        }

        await _db.SaveChangesAsync(ct);
        return Result<int>.Success(count);
    }
}
