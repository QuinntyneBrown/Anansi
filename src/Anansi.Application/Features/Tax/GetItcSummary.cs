using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Get Input Tax Credit (ITC) summary (TAX-21.4.2).
/// Compares HST collected from payments against HST paid on expenses.
/// </summary>
public record GetItcSummaryQuery(DateTime? From, DateTime? To) : IRequest<Result<ItcSummaryDto>>;

public class GetItcSummaryHandler : IRequestHandler<GetItcSummaryQuery, Result<ItcSummaryDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetItcSummaryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ItcSummaryDto>> Handle(GetItcSummaryQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var from = request.From ?? DateTime.UtcNow.AddYears(-1);
        var to = request.To ?? DateTime.UtcNow;

        // HST collected from payment records (TaxCents field)
        var hstCollected = await _db.Set<PaymentRecord>()
            .AsNoTracking()
            .Where(p => p.PhotographerId == photographerId
                && !p.IsRefund
                && p.CreatedAt >= from
                && p.CreatedAt <= to)
            .SumAsync(p => p.TaxCents, ct);

        // HST paid on business expenses (ITCs)
        var expenses = await _db.BusinessExpenses
            .AsNoTracking()
            .Where(e => e.PhotographerId == photographerId
                && e.Date >= from
                && e.Date <= to)
            .ToListAsync(ct);

        var hstPaidOnExpenses = expenses.Sum(e => e.HstPaidCents);
        var netHstOwing = hstCollected - hstPaidOnExpenses;

        var categoryBreakdown = expenses
            .GroupBy(e => e.Category)
            .Select(g => new CategoryBreakdownDto(g.Key, g.Sum(e => e.HstPaidCents)))
            .OrderByDescending(c => c.HstPaidCents)
            .ToList();

        return Result<ItcSummaryDto>.Success(
            new ItcSummaryDto(hstCollected, hstPaidOnExpenses, netHstOwing, categoryBreakdown));
    }
}
