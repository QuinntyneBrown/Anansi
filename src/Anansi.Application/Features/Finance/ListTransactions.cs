using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Finance;

/// <summary>
/// List transactions with search and filter (RPT-4.10.2).
/// </summary>
public record ListTransactionsQuery(
    PaymentMethod? MethodFilter,
    string? Search,
    DateTime? From,
    DateTime? To,
    int Page = 1,
    int PageSize = 25) : IRequest<Result<PagedList<PaymentRecordDto>>>;

public class ListTransactionsHandler : IRequestHandler<ListTransactionsQuery, Result<PagedList<PaymentRecordDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListTransactionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<PaymentRecordDto>>> Handle(ListTransactionsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<PaymentRecord>()
            .Where(p => p.PhotographerId == photographerId);

        if (request.MethodFilter.HasValue) query = query.Where(p => p.PaymentMethod == request.MethodFilter.Value);
        if (request.From.HasValue) query = query.Where(p => p.CreatedAt >= request.From.Value);
        if (request.To.HasValue) query = query.Where(p => p.CreatedAt <= request.To.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(p => (p.Description != null && p.Description.ToLower().Contains(s))
                || (p.CardLast4 != null && p.CardLast4.Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new PaymentRecordDto(
                p.Id, p.ContactId, p.InvoiceId, p.BookingId,
                p.AmountCents, p.FeeCents, p.NetAmountCents,
                p.TipCents, p.TaxCents, p.Currency,
                p.PaymentMethod, p.ExternalPaymentId, p.CardLast4,
                p.Description, p.IsOffline, p.IsRefund, p.CreatedAt))
            .ToListAsync(ct);

        return Result<PagedList<PaymentRecordDto>>.Success(
            new PagedList<PaymentRecordDto>(items, total, request.Page, request.PageSize));
    }
}
