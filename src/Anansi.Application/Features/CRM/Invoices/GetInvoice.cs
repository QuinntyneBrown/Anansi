using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Invoices;

public record GetInvoiceQuery(Guid Id) : IRequest<Result<InvoiceDto>>;

public class GetInvoiceHandler : IRequestHandler<GetInvoiceQuery, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetInvoiceHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var invoice = await _db.Set<Invoice>()
            .Include(i => i.Contact)
            .Include(i => i.LineItems)
            .Include(i => i.PaymentSchedules)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.PhotographerId == photographerId, ct);

        if (invoice is null) return Result<InvoiceDto>.NotFound("Invoice not found");
        return Result<InvoiceDto>.Success(CreateInvoiceHandler.MapToDto(invoice));
    }
}

public record ListInvoicesQuery(InvoiceStatus? StatusFilter, bool? IsTemplate, int Page = 1, int PageSize = 25)
    : IRequest<Result<PagedList<InvoiceDto>>>;

public class ListInvoicesHandler : IRequestHandler<ListInvoicesQuery, Result<PagedList<InvoiceDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListInvoicesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<InvoiceDto>>> Handle(ListInvoicesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<Invoice>()
            .Include(i => i.Contact)
            .Include(i => i.LineItems)
            .Include(i => i.PaymentSchedules)
            .Where(i => i.PhotographerId == photographerId);

        if (request.StatusFilter.HasValue) query = query.Where(i => i.Status == request.StatusFilter.Value);
        if (request.IsTemplate.HasValue) query = query.Where(i => i.IsTemplate == request.IsTemplate.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return Result<PagedList<InvoiceDto>>.Success(
            new PagedList<InvoiceDto>(items.Select(CreateInvoiceHandler.MapToDto).ToList(), total, request.Page, request.PageSize));
    }
}
