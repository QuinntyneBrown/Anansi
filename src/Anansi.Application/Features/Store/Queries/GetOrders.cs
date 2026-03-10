using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

/// <summary>
/// Lists orders with filtering (STR-2.5.4).
/// </summary>
public record GetOrdersQuery(
    OrderStatus? Status,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<Result<PagedList<OrderDto>>>;

public class GetOrdersHandler : IRequestHandler<GetOrdersQuery, Result<PagedList<OrderDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetOrdersHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<OrderDto>>> Handle(GetOrdersQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<OrderDto>>.Forbidden();

        var q = _db.Orders
            .Include(o => o.Items)
            .Where(o => o.PhotographerId == _currentUser.PhotographerId)
            .AsQueryable();

        if (query.Status.HasValue)
            q = q.Where(o => o.Status == query.Status);

        if (!string.IsNullOrEmpty(query.Search))
            q = q.Where(o => o.ClientName.Contains(query.Search)
                || o.ClientEmail.Contains(query.Search));

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(o => o.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var dtos = items.Select(o => new OrderDto(
            o.Id, o.ClientName, o.ClientEmail, o.ClientPhone,
            o.ShippingAddress, o.ShippingCity, o.ShippingProvince,
            o.ShippingPostalCode, o.ShippingCountry,
            o.Status, o.PaymentMethod, o.FulfillmentType, o.LabPartner,
            o.SubtotalCents, o.TaxCents, o.ShippingCents, o.DiscountCents,
            o.TotalCents, o.CommissionCents, o.CommissionPercentage,
            o.CouponCode, o.GiftCardCode, o.TrackingNumber, o.TrackingUrl,
            o.Items.Select(i => new OrderItemDto(
                i.Id, i.ProductId, i.ProductName, i.ProductVariationId,
                i.VariationName, i.Quantity, i.UnitPriceCents,
                i.TotalCents, i.SelectedPhotoUrl)).ToList(),
            o.CreatedAt, o.UpdatedAt)).ToList();

        return Result<PagedList<OrderDto>>.Success(
            new PagedList<OrderDto>(dtos, total, query.Page, query.PageSize));
    }
}
