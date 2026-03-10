using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Tax;

/// <summary>
/// Get revenue threshold status for HST registration (TAX-21.3.1).
/// Rolling 4-quarter revenue from PaymentRecords against the $30,000 threshold.
/// </summary>
public record GetThresholdStatusQuery : IRequest<Result<ThresholdStatusDto>>;

public class GetThresholdStatusHandler : IRequestHandler<GetThresholdStatusQuery, Result<ThresholdStatusDto>>
{
    private const long ThresholdCents = 30_000_00; // $30,000 in cents

    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetThresholdStatusHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ThresholdStatusDto>> Handle(GetThresholdStatusQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        // Determine the rolling 4-quarter window
        var now = DateTime.UtcNow;
        var currentQuarter = (now.Month - 1) / 3 + 1;
        var currentYear = now.Year;

        // Build list of the last 4 quarters (current + 3 prior)
        var quarters = new List<(int Year, int Quarter, DateTime Start, DateTime End)>();
        for (int i = 0; i < 4; i++)
        {
            var q = currentQuarter - i;
            var y = currentYear;
            while (q <= 0) { q += 4; y--; }

            var startMonth = (q - 1) * 3 + 1;
            var start = new DateTime(y, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(3);
            quarters.Add((y, q, start, end));
        }

        var windowStart = quarters.Min(q => q.Start);
        var windowEnd = quarters.Max(q => q.End);

        // Fetch all non-refund payments in the rolling window
        var payments = await _db.Set<PaymentRecord>()
            .AsNoTracking()
            .Where(p => p.PhotographerId == photographerId
                && !p.IsRefund
                && p.CreatedAt >= windowStart
                && p.CreatedAt < windowEnd)
            .ToListAsync(ct);

        // Build quarterly breakdown
        var breakdown = quarters
            .OrderBy(q => q.Year).ThenBy(q => q.Quarter)
            .Select(q => new QuarterlyBreakdownDto(
                q.Year,
                q.Quarter,
                payments.Where(p => p.CreatedAt >= q.Start && p.CreatedAt < q.End)
                    .Sum(p => p.AmountCents)))
            .ToList();

        var rollingRevenue = breakdown.Sum(b => b.RevenueCents);
        var thresholdPercentage = Math.Round((decimal)rollingRevenue / ThresholdCents * 100, 2);

        var alertLevel = thresholdPercentage switch
        {
            >= 100 => ThresholdAlertLevel.Exceeded,
            >= 90 => ThresholdAlertLevel.Critical,
            >= 75 => ThresholdAlertLevel.Warning,
            _ => ThresholdAlertLevel.None
        };

        return Result<ThresholdStatusDto>.Success(
            new ThresholdStatusDto(rollingRevenue, thresholdPercentage, breakdown, alertLevel));
    }
}
