using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a coupon code (STR-2.4.1, STR-2.4.2).
/// </summary>
public record CreateCouponCommand(CreateCouponRequest Request) : IRequest<Result<CouponDto>>;

public class CreateCouponValidator : AbstractValidator<CreateCouponCommand>
{
    public CreateCouponValidator()
    {
        RuleFor(x => x.Request.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Request.CouponType).IsInEnum();
        RuleFor(x => x.Request.Scope).IsInEnum();
        RuleFor(x => x.Request.PercentageValue)
            .InclusiveBetween(0.01m, 100m)
            .When(x => x.Request.CouponType == CouponType.PercentageOff);
        RuleFor(x => x.Request.FixedAmountCents)
            .GreaterThan(0)
            .When(x => x.Request.CouponType == CouponType.FixedAmountOff);
    }
}

public class CreateCouponHandler : IRequestHandler<CreateCouponCommand, Result<CouponDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCouponHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CouponDto>> Handle(CreateCouponCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CouponDto>.Forbidden();

        var req = cmd.Request;
        var coupon = new Coupon
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Code = req.Code.ToUpperInvariant(),
            CouponType = req.CouponType,
            Scope = req.Scope,
            PercentageValue = req.PercentageValue,
            FixedAmountCents = req.FixedAmountCents,
            MinimumOrderCents = req.MinimumOrderCents,
            ExpirationDate = req.ExpirationDate,
            UsageLimit = req.UsageLimit,
            BannerText = req.BannerText,
            BannerColorHex = req.BannerColorHex,
            ShowBanner = req.ShowBanner
        };

        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync(ct);

        return Result<CouponDto>.Success(new CouponDto(
            coupon.Id, coupon.Code, coupon.CouponType, coupon.Scope,
            coupon.PercentageValue, coupon.FixedAmountCents, coupon.MinimumOrderCents,
            coupon.ExpirationDate, coupon.UsageLimit, coupon.TimesUsed,
            coupon.IsActive, coupon.BannerText, coupon.BannerColorHex, coupon.ShowBanner,
            coupon.CreatedAt));
    }
}
