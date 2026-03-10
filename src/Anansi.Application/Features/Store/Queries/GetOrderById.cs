using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetOrderByIdQuery(Guid OrderId) : IRequest<Result<OrderDto>>;

public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetOrderByIdHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<OrderDto>.Forbidden();

        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == query.OrderId && o.PhotographerId == _currentUser.PhotographerId, ct);

        if (order is null)
            return Result<OrderDto>.NotFound("Order not found");

        return Result<OrderDto>.Success(new OrderDto(
            order.Id, order.ClientName, order.ClientEmail, order.ClientPhone,
            order.ShippingAddress, order.ShippingCity, order.ShippingProvince,
            order.ShippingPostalCode, order.ShippingCountry,
            order.Status, order.PaymentMethod, order.FulfillmentType, order.LabPartner,
            order.SubtotalCents, order.TaxCents, order.ShippingCents, order.DiscountCents,
            order.TotalCents, order.CommissionCents, order.CommissionPercentage,
            order.CouponCode, order.GiftCardCode, order.TrackingNumber, order.TrackingUrl,
            order.InteracPaymentReference,
            order.Items.Select(i => new OrderItemDto(
                i.Id, i.ProductId, i.ProductName, i.ProductVariationId,
                i.VariationName, i.Quantity, i.UnitPriceCents,
                i.TotalCents, i.SelectedPhotoUrl)).ToList(),
            order.CreatedAt, order.UpdatedAt));
    }
}
