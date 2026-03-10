using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Interac;

/// <summary>
/// List Interac e-Transfer payment requests with optional status filter (INT-20.1.3, INT-20.1.4).
/// Expired requests are auto-detected on read.
/// </summary>
public record GetInteracPaymentRequestsQuery(
    InteracPaymentStatus? StatusFilter,
    int Page = 1,
    int PageSize = 25) : IRequest<Result<PagedList<InteracPaymentRequestDto>>>;

public class GetInteracPaymentRequestsHandler : IRequestHandler<GetInteracPaymentRequestsQuery, Result<PagedList<InteracPaymentRequestDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetInteracPaymentRequestsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<InteracPaymentRequestDto>>> Handle(GetInteracPaymentRequestsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<InteracPaymentRequestDto>>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;
        var now = DateTime.UtcNow;

        // Auto-expire stale pending requests in the database (INT-20.1.4)
        var staleRequests = await _db.InteracPaymentRequests
            .Where(r => r.PhotographerId == photographerId
                && r.Status == InteracPaymentStatus.Pending
                && r.ExpiresAt <= now)
            .ToListAsync(ct);

        if (staleRequests.Count > 0)
        {
            foreach (var stale in staleRequests)
                stale.Status = InteracPaymentStatus.Expired;
            await _db.SaveChangesAsync(ct);
        }

        var query = _db.InteracPaymentRequests
            .Where(r => r.PhotographerId == photographerId);

        if (request.StatusFilter.HasValue)
            query = query.Where(r => r.Status == request.StatusFilter.Value);

        var total = await query.CountAsync(ct);

        // Batch-load associated invoices to avoid N+1
        var pagedRequests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var invoiceIds = pagedRequests.Select(r => r.InvoiceId).Distinct().ToList();
        var invoices = await _db.Set<Invoice>()
            .Include(i => i.Contact)
            .Where(i => invoiceIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, ct);

        var items = pagedRequests.Select(r =>
        {
            invoices.TryGetValue(r.InvoiceId, out var invoice);
            return new InteracPaymentRequestDto(
                r.Id,
                r.InvoiceId,
                invoice?.InvoiceNumber,
                r.AmountCents,
                r.PaymentReference,
                r.RecipientEmail,
                invoice?.Contact?.Email,
                r.Status,
                r.ExpiresAt,
                r.ConfirmedAt,
                r.CreatedAt);
        }).ToList();

        return Result<PagedList<InteracPaymentRequestDto>>.Success(
            new PagedList<InteracPaymentRequestDto>(items, total, request.Page, request.PageSize));
    }
}
