using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Booking;

/// <summary>
/// Create a booking coupon (BKG-4.3.12).
/// </summary>
public record CreateBookingCouponCommand(
    string Code,
    CouponType CouponType,
    decimal? PercentageValue,
    long? FixedAmountCents,
    DateTime? ExpirationDate,
    int? UsageLimit) : IRequest<Result<BookingCouponDto>>;

public class CreateBookingCouponValidator : AbstractValidator<CreateBookingCouponCommand>
{
    public CreateBookingCouponValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100);
    }
}

public class CreateBookingCouponHandler : IRequestHandler<CreateBookingCouponCommand, Result<BookingCouponDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBookingCouponHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BookingCouponDto>> Handle(CreateBookingCouponCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var coupon = new BookingCoupon
        {
            PhotographerId = photographerId,
            Code = request.Code,
            CouponType = request.CouponType,
            PercentageValue = request.PercentageValue,
            FixedAmountCents = request.FixedAmountCents,
            ExpirationDate = request.ExpirationDate,
            UsageLimit = request.UsageLimit
        };

        _db.Set<BookingCoupon>().Add(coupon);
        await _db.SaveChangesAsync(ct);

        return Result<BookingCouponDto>.Success(new BookingCouponDto(
            coupon.Id, coupon.Code, coupon.CouponType, coupon.PercentageValue,
            coupon.FixedAmountCents, coupon.ExpirationDate, coupon.UsageLimit,
            coupon.TimesUsed, coupon.IsActive, coupon.CreatedAt));
    }
}
