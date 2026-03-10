using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetCouponsQuery : IRequest<Result<List<CouponDto>>>;

public class GetCouponsHandler : IRequestHandler<GetCouponsQuery, Result<List<CouponDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCouponsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CouponDto>>> Handle(GetCouponsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<CouponDto>>.Forbidden();

        var coupons = await _db.Coupons
            .Where(c => c.PhotographerId == _currentUser.PhotographerId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        var dtos = coupons.Select(c => new CouponDto(
            c.Id, c.Code, c.CouponType, c.Scope,
            c.PercentageValue, c.FixedAmountCents, c.MinimumOrderCents,
            c.ExpirationDate, c.UsageLimit, c.TimesUsed,
            c.IsActive, c.BannerText, c.BannerColorHex, c.ShowBanner,
            c.CreatedAt)).ToList();

        return Result<List<CouponDto>>.Success(dtos);
    }
}
