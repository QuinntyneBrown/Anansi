using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Finance;

/// <summary>
/// Revenue dashboard (RPT-4.10.1, RPT-4.10.4).
/// </summary>
public record GetRevenueDashboardQuery(DateTime? From, DateTime? To) : IRequest<Result<RevenueDashboardDto>>;

public class GetRevenueDashboardHandler : IRequestHandler<GetRevenueDashboardQuery, Result<RevenueDashboardDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetRevenueDashboardHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<RevenueDashboardDto>> Handle(GetRevenueDashboardQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<PaymentRecord>()
            .Where(p => p.PhotographerId == photographerId);

        if (request.From.HasValue) query = query.Where(p => p.CreatedAt >= request.From.Value);
        if (request.To.HasValue) query = query.Where(p => p.CreatedAt <= request.To.Value);

        var payments = await query.ToListAsync(ct);

        var totalRevenue = payments.Where(p => !p.IsRefund).Sum(p => p.AmountCents);
        var totalFees = payments.Where(p => !p.IsRefund).Sum(p => p.FeeCents);
        var totalRefunds = payments.Where(p => p.IsRefund).Sum(p => p.AmountCents);
        var totalTips = payments.Sum(p => p.TipCents);
        var totalTax = payments.Sum(p => p.TaxCents);
        var netRevenue = totalRevenue - totalFees - totalRefunds;

        var breakdown = payments
            .Where(p => !p.IsRefund)
            .GroupBy(p => p.PaymentMethod)
            .Select(g => new PaymentMethodBreakdownDto(g.Key, g.Sum(p => p.AmountCents), g.Count()))
            .ToList();

        // Invoice tracking (RPT-4.10.4)
        var invoiceQuery = _db.Set<Invoice>()
            .Where(i => i.PhotographerId == photographerId && !i.IsTemplate);

        var paidCount = await invoiceQuery.CountAsync(i => i.Status == InvoiceStatus.Paid, ct);
        var pendingCount = await invoiceQuery.CountAsync(i =>
            i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Viewed || i.Status == InvoiceStatus.PartiallyPaid, ct);
        var overdueCount = await invoiceQuery.CountAsync(i => i.Status == InvoiceStatus.Overdue, ct);

        return Result<RevenueDashboardDto>.Success(new RevenueDashboardDto(
            totalRevenue, netRevenue, totalFees, totalRefunds, totalTips, totalTax,
            breakdown, paidCount, pendingCount, overdueCount));
    }
}
