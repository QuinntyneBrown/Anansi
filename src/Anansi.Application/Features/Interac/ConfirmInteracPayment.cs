using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Interac;

/// <summary>
/// Confirm receipt of an Interac e-Transfer payment (INT-20.1.2).
/// Creates a PaymentRecord and updates the linked invoice.
/// </summary>
public record ConfirmInteracPaymentCommand(Guid Id) : IRequest<Result<InteracPaymentRequestDto>>;

public class ConfirmInteracPaymentValidator : AbstractValidator<ConfirmInteracPaymentCommand>
{
    public ConfirmInteracPaymentValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class ConfirmInteracPaymentHandler : IRequestHandler<ConfirmInteracPaymentCommand, Result<InteracPaymentRequestDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ConfirmInteracPaymentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<InteracPaymentRequestDto>> Handle(ConfirmInteracPaymentCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<InteracPaymentRequestDto>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;

        var paymentRequest = await _db.InteracPaymentRequests
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.PhotographerId == photographerId, ct);
        if (paymentRequest is null)
            return Result<InteracPaymentRequestDto>.NotFound("Payment request not found.");

        if (paymentRequest.Status == InteracPaymentStatus.Completed)
            return Result<InteracPaymentRequestDto>.Failure("Payment request is already confirmed.");

        if (paymentRequest.ExpiresAt <= DateTime.UtcNow)
        {
            paymentRequest.Status = InteracPaymentStatus.Expired;
            await _db.SaveChangesAsync(ct);
            return Result<InteracPaymentRequestDto>.Failure("Payment request has expired.");
        }

        // Mark the request as completed
        paymentRequest.Status = InteracPaymentStatus.Completed;
        paymentRequest.ConfirmedAt = DateTime.UtcNow;

        // Create a PaymentRecord (zero fees for Interac e-Transfer)
        var payment = new PaymentRecord
        {
            PhotographerId = photographerId,
            InvoiceId = paymentRequest.InvoiceId,
            AmountCents = paymentRequest.AmountCents,
            FeeCents = 0,
            NetAmountCents = paymentRequest.AmountCents,
            TipCents = 0,
            Currency = "cad",
            PaymentMethod = PaymentMethod.InteracETransfer,
            ExternalPaymentId = paymentRequest.PaymentReference,
            Description = $"Interac e-Transfer ({paymentRequest.PaymentReference})",
            IsOffline = false
        };
        _db.Set<PaymentRecord>().Add(payment);

        // Update invoice paid amount and status
        var invoice = await _db.Set<Invoice>()
            .Include(i => i.Contact)
            .FirstOrDefaultAsync(i => i.Id == paymentRequest.InvoiceId && i.PhotographerId == photographerId, ct);
        if (invoice is not null)
        {
            invoice.PaidCents += paymentRequest.AmountCents;
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

        await _db.SaveChangesAsync(ct);

        return Result<InteracPaymentRequestDto>.Success(new InteracPaymentRequestDto(
            paymentRequest.Id,
            paymentRequest.InvoiceId,
            invoice?.InvoiceNumber,
            paymentRequest.AmountCents,
            paymentRequest.PaymentReference,
            paymentRequest.RecipientEmail,
            invoice?.Contact?.Email,
            paymentRequest.Status,
            paymentRequest.ExpiresAt,
            paymentRequest.ConfirmedAt,
            paymentRequest.CreatedAt));
    }
}
