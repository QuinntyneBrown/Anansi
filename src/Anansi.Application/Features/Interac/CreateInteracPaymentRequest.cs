using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Interac;

/// <summary>
/// Create an Interac e-Transfer payment request from an invoice (INT-20.1.1).
/// </summary>
public record CreateInteracPaymentRequestCommand(Guid InvoiceId) : IRequest<Result<InteracPaymentRequestDto>>;

public class CreateInteracPaymentRequestValidator : AbstractValidator<CreateInteracPaymentRequestCommand>
{
    public CreateInteracPaymentRequestValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
    }
}

public class CreateInteracPaymentRequestHandler : IRequestHandler<CreateInteracPaymentRequestCommand, Result<InteracPaymentRequestDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateInteracPaymentRequestHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<InteracPaymentRequestDto>> Handle(CreateInteracPaymentRequestCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<InteracPaymentRequestDto>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;

        var photographer = await _db.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == photographerId, ct);
        if (photographer is null)
            return Result<InteracPaymentRequestDto>.NotFound("Photographer not found.");

        if (string.IsNullOrWhiteSpace(photographer.InteracEmail))
            return Result<InteracPaymentRequestDto>.Failure("Interac e-Transfer email is not configured. Please configure it in settings first.");

        var invoice = await _db.Set<Invoice>()
            .Include(i => i.Contact)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.PhotographerId == photographerId, ct);
        if (invoice is null)
            return Result<InteracPaymentRequestDto>.NotFound("Invoice not found.");

        var remainingCents = invoice.TotalCents - invoice.PaidCents;
        if (remainingCents <= 0)
            return Result<InteracPaymentRequestDto>.Failure("Invoice is already fully paid.");

        var reference = $"ANANSI-INV-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";

        var paymentRequest = new InteracPaymentRequest
        {
            PhotographerId = photographerId,
            InvoiceId = invoice.Id,
            AmountCents = remainingCents,
            PaymentReference = reference,
            RecipientEmail = photographer.InteracEmail,
            Status = InteracPaymentStatus.Pending,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        _db.InteracPaymentRequests.Add(paymentRequest);
        await _db.SaveChangesAsync(ct);

        return Result<InteracPaymentRequestDto>.Success(new InteracPaymentRequestDto(
            paymentRequest.Id,
            paymentRequest.InvoiceId,
            invoice.InvoiceNumber,
            paymentRequest.AmountCents,
            paymentRequest.PaymentReference,
            paymentRequest.RecipientEmail,
            invoice.Contact?.Email,
            paymentRequest.Status,
            paymentRequest.ExpiresAt,
            paymentRequest.ConfirmedAt,
            paymentRequest.CreatedAt));
    }
}
