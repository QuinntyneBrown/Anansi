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
/// Record a payment (PAY-4.8.1 through PAY-4.8.7).
/// </summary>
public record RecordPaymentCommand(
    Guid? ContactId,
    Guid? InvoiceId,
    Guid? BookingId,
    long AmountCents,
    long TipCents,
    string Currency,
    PaymentMethod PaymentMethod,
    string? ExternalPaymentId,
    string? CardLast4,
    string? Description,
    bool IsOffline,
    Guid? GiftCardId) : IRequest<Result<PaymentRecordDto>>;

public class RecordPaymentHandler : IRequestHandler<RecordPaymentCommand, Result<PaymentRecordDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordPaymentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PaymentRecordDto>> Handle(RecordPaymentCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        // Calculate fees (PAY-4.8.1: 2.9% + $0.30 for cards; PAY-4.8.4: 1% for ACH)
        long feeCents = 0;
        if (!request.IsOffline)
        {
            feeCents = request.PaymentMethod == PaymentMethod.BankTransfer
                ? (long)(request.AmountCents * 0.01m)
                : (long)(request.AmountCents * 0.029m) + 30;
        }

        var payment = new PaymentRecord
        {
            PhotographerId = photographerId,
            ContactId = request.ContactId,
            InvoiceId = request.InvoiceId,
            BookingId = request.BookingId,
            AmountCents = request.AmountCents,
            FeeCents = feeCents,
            NetAmountCents = request.AmountCents - feeCents,
            TipCents = request.TipCents,
            Currency = request.Currency,
            PaymentMethod = request.PaymentMethod,
            ExternalPaymentId = request.ExternalPaymentId,
            CardLast4 = request.CardLast4,
            Description = request.Description,
            IsOffline = request.IsOffline,
            GiftCardId = request.GiftCardId
        };

        _db.Set<PaymentRecord>().Add(payment);

        // Update invoice paid amount if linked
        if (request.InvoiceId.HasValue)
        {
            var invoice = await _db.Set<Invoice>()
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.PhotographerId == photographerId, ct);
            if (invoice is not null)
            {
                invoice.PaidCents += request.AmountCents;
                invoice.TipAmountCents += request.TipCents;
                if (invoice.PaidCents >= invoice.TotalCents)
                    invoice.Status = InvoiceStatus.Paid;
                else if (invoice.PaidCents > 0)
                    invoice.Status = InvoiceStatus.PartiallyPaid;

                // Auto-convert lead to client (CRM-4.1.3)
                if (invoice.ContactId.HasValue)
                {
                    var contact = await _db.Set<Contact>()
                        .FirstOrDefaultAsync(c => c.Id == invoice.ContactId, ct);
                    if (contact is not null && contact.ContactType == ContactType.Lead)
                        contact.ContactType = ContactType.Client;
                }
            }
        }

        // Deduct gift card balance (GFT-4.9.2)
        if (request.GiftCardId.HasValue)
        {
            var gc = await _db.Set<Domain.Entities.Store.GiftCard>()
                .FirstOrDefaultAsync(g => g.Id == request.GiftCardId && g.PhotographerId == photographerId, ct);
            if (gc is not null)
            {
                gc.BalanceCents = Math.Max(0, gc.BalanceCents - request.AmountCents);
                if (gc.BalanceCents == 0) gc.IsActive = false;
            }
        }

        await _db.SaveChangesAsync(ct);

        return Result<PaymentRecordDto>.Success(new PaymentRecordDto(
            payment.Id, payment.ContactId, payment.InvoiceId, payment.BookingId,
            payment.AmountCents, payment.FeeCents, payment.NetAmountCents,
            payment.TipCents, payment.TaxCents, payment.Currency,
            payment.PaymentMethod, payment.ExternalPaymentId, payment.CardLast4,
            payment.Description, payment.IsOffline, payment.IsRefund, payment.CreatedAt));
    }
}
