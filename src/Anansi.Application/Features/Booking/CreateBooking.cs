using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Booking;

/// <summary>
/// Create a booking (BKG-4.3.4). Handles buffer time blocking (BKG-4.3.6),
/// manual confirmation (BKG-4.3.7), automatic lead conversion (CRM-4.1.3).
/// </summary>
public record CreateBookingCommand(
    Guid SessionTypeId,
    string ClientFirstName,
    string ClientLastName,
    string ClientEmail,
    string? ClientPhone,
    DateTime StartTime,
    string? CouponCode,
    string? Notes) : IRequest<Result<BookingRecordDto>>;

public class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.SessionTypeId).NotEmpty();
        RuleFor(x => x.ClientFirstName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientLastName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.StartTime).GreaterThan(DateTime.UtcNow);
    }
}

public class CreateBookingHandler : IRequestHandler<CreateBookingCommand, Result<BookingRecordDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBookingHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BookingRecordDto>> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var sessionType = await _db.Set<SessionType>()
            .FirstOrDefaultAsync(s => s.Id == request.SessionTypeId && s.PhotographerId == photographerId, ct);

        if (sessionType is null) return Result<BookingRecordDto>.NotFound("Session type not found");

        var endTime = request.StartTime.AddMinutes(sessionType.DurationMinutes);

        // Check buffer time conflicts (BKG-4.3.6)
        var bufferStart = request.StartTime.AddMinutes(-sessionType.BufferBeforeMinutes);
        var bufferEnd = endTime.AddMinutes(sessionType.BufferAfterMinutes);

        var conflict = await _db.Set<BookingRecord>()
            .AnyAsync(b => b.PhotographerId == photographerId
                && b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.Declined
                && b.StartTime < bufferEnd && b.EndTime > bufferStart, ct);

        if (conflict) return Result<BookingRecordDto>.Failure("Time slot is not available due to scheduling conflict.");

        // Handle coupon (BKG-4.3.12)
        long discountCents = 0;
        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = await _db.Set<BookingCoupon>()
                .FirstOrDefaultAsync(c => c.PhotographerId == photographerId
                    && c.Code == request.CouponCode && c.IsActive, ct);
            if (coupon is not null && (!coupon.ExpirationDate.HasValue || coupon.ExpirationDate > DateTime.UtcNow)
                && (!coupon.UsageLimit.HasValue || coupon.TimesUsed < coupon.UsageLimit))
            {
                discountCents = coupon.CouponType == CouponType.PercentageOff
                    ? (long)(sessionType.PriceCents * (coupon.PercentageValue ?? 0) / 100m)
                    : coupon.FixedAmountCents ?? 0;
                coupon.TimesUsed++;
            }
        }

        var status = sessionType.RequireManualConfirmation ? BookingStatus.Pending : BookingStatus.Confirmed;

        var booking = new BookingRecord
        {
            PhotographerId = photographerId,
            SessionTypeId = sessionType.Id,
            ClientFirstName = request.ClientFirstName,
            ClientLastName = request.ClientLastName,
            ClientEmail = request.ClientEmail,
            ClientPhone = request.ClientPhone,
            StartTime = request.StartTime,
            EndTime = endTime,
            Status = status,
            Location = sessionType.Location,
            CouponCode = request.CouponCode,
            DiscountCents = discountCents,
            Notes = request.Notes
        };

        // Auto-create or find contact, auto-convert lead to client (CRM-4.1.3)
        var contact = await _db.Set<Contact>()
            .FirstOrDefaultAsync(c => c.PhotographerId == photographerId
                && c.Email.ToLower() == request.ClientEmail.ToLower(), ct);

        if (contact is not null)
        {
            booking.ContactId = contact.Id;
            if (contact.ContactType == ContactType.Lead)
                contact.ContactType = ContactType.Client;
        }
        else
        {
            contact = new Contact
            {
                PhotographerId = photographerId,
                FirstName = request.ClientFirstName,
                LastName = request.ClientLastName,
                Email = request.ClientEmail,
                Phone = request.ClientPhone,
                ContactType = ContactType.Client
            };
            _db.Set<Contact>().Add(contact);
            booking.ContactId = contact.Id;
        }

        _db.Set<BookingRecord>().Add(booking);
        await _db.SaveChangesAsync(ct);

        return Result<BookingRecordDto>.Success(new BookingRecordDto(
            booking.Id, booking.SessionTypeId, sessionType.Name, booking.ContactId,
            booking.ClientFirstName, booking.ClientLastName, booking.ClientEmail, booking.ClientPhone,
            booking.StartTime, booking.EndTime, booking.Status, booking.Location,
            booking.VideoCallLink, booking.AmountPaidCents, booking.CouponCode,
            booking.DiscountCents, booking.Notes, booking.CreatedAt));
    }
}
