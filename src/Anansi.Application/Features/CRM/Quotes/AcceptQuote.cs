using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Quotes;

/// <summary>
/// Client accepts a quote, auto-generating an invoice draft (QOT-4.6.2).
/// </summary>
public record AcceptQuoteCommand(Guid QuoteId) : IRequest<Result<QuoteDto>>;

public class AcceptQuoteHandler : IRequestHandler<AcceptQuoteCommand, Result<QuoteDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AcceptQuoteHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuoteDto>> Handle(AcceptQuoteCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var quote = await _db.Set<Quote>()
            .Include(q => q.Items)
            .Include(q => q.Contact)
            .FirstOrDefaultAsync(q => q.Id == request.QuoteId && q.PhotographerId == photographerId, ct);

        if (quote is null) return Result<QuoteDto>.NotFound("Quote not found");
        if (quote.Status != QuoteStatus.Sent && quote.Status != QuoteStatus.Viewed)
            return Result<QuoteDto>.Failure("Quote is not in a state that can be accepted.");

        quote.Status = QuoteStatus.Accepted;
        quote.AcceptedAt = DateTime.UtcNow;

        // Auto-generate invoice draft (QOT-4.6.2)
        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var invoice = new Invoice
        {
            PhotographerId = photographerId,
            InvoiceNumber = invoiceNumber,
            Title = $"Invoice from Quote: {quote.Title}",
            ContactId = quote.ContactId,
            ProjectId = quote.ProjectId,
            Status = InvoiceStatus.Draft,
            DueDate = DateTime.UtcNow.AddDays(30)
        };

        long subtotal = 0;
        foreach (var item in quote.Items)
        {
            var lineTotal = item.UnitPriceCents * item.Quantity;
            subtotal += lineTotal;
            invoice.LineItems.Add(new InvoiceLineItem
            {
                Name = item.Name,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPriceCents = item.UnitPriceCents,
                TotalCents = lineTotal,
                SortOrder = item.SortOrder
            });
        }
        invoice.SubtotalCents = subtotal;
        invoice.TotalCents = subtotal;

        _db.Set<Invoice>().Add(invoice);
        quote.GeneratedInvoiceId = invoice.Id;

        await _db.SaveChangesAsync(ct);

        return Result<QuoteDto>.Success(CreateQuoteHandler.MapToDto(quote));
    }
}
