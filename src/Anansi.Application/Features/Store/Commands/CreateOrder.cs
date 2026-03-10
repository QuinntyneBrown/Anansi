using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates an order (STR-2.5.1, STR-2.5.4, STR-2.3.4).
/// Handles commission calculation, coupon/gift card application.
/// </summary>
public record CreateOrderCommand(CreateOrderRequest Request) : IRequest<Result<OrderDto>>;

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.Request.ClientName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.ClientEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.Items).NotEmpty();
        RuleForEach(x => x.Request.Items).ChildRules(i =>
        {
            i.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateOrderHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<OrderDto>.Forbidden();

        var photographerId = _currentUser.PhotographerId.Value;
        var req = cmd.Request;

        // Determine commission rate (STR-2.3.4)
        var subscription = await _db.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.PhotographerId == photographerId
                && s.Status == SubscriptionStatus.Active, ct);

        var commissionPct = 15m; // Free plan: 15%
        if (subscription is not null && subscription.Plan.Tier != PlanTier.Free)
            commissionPct = 0m; // Paid plans: 0%

        // Determine fulfillment type from first item's product
        var firstProduct = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == req.Items[0].ProductId, ct);
        var fulfillmentType = firstProduct?.FulfillmentType ?? FulfillmentType.SelfFulfilled;

        var order = new Order
        {
            PhotographerId = photographerId,
            ClientName = req.ClientName,
            ClientEmail = req.ClientEmail,
            ClientPhone = req.ClientPhone,
            ShippingAddress = req.ShippingAddress,
            ShippingCity = req.ShippingCity,
            ShippingProvince = req.ShippingProvince,
            ShippingPostalCode = req.ShippingPostalCode,
            ShippingCountry = req.ShippingCountry,
            PaymentMethod = req.PaymentMethod,
            ShippingMethodId = req.ShippingMethodId,
            CouponCode = req.CouponCode,
            GiftCardCode = req.GiftCardCode,
            FulfillmentType = fulfillmentType,
            LabPartner = firstProduct?.LabPartner,
            CommissionPercentage = commissionPct
        };

        // Batch-load all products and variations upfront to avoid N+1 queries
        var productIds = req.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id) && p.PhotographerId == photographerId)
            .ToDictionaryAsync(p => p.Id, ct);

        var variationIds = req.Items
            .Where(i => i.ProductVariationId.HasValue)
            .Select(i => i.ProductVariationId!.Value)
            .Distinct().ToList();
        var variations = variationIds.Count > 0
            ? await _db.ProductVariations
                .Where(v => variationIds.Contains(v.Id))
                .ToDictionaryAsync(v => v.Id, ct)
            : new Dictionary<Guid, ProductVariation>();

        long subtotal = 0;
        foreach (var itemReq in req.Items)
        {
            if (!products.TryGetValue(itemReq.ProductId, out var product))
                return Result<OrderDto>.Failure($"Product {itemReq.ProductId} not found");

            ProductVariation? variation = null;
            long unitPrice;
            if (itemReq.ProductVariationId.HasValue)
            {
                if (!variations.TryGetValue(itemReq.ProductVariationId.Value, out variation) || variation.ProductId != product.Id)
                    return Result<OrderDto>.Failure($"Variation {itemReq.ProductVariationId} not found");
                unitPrice = variation.PriceCents;
            }
            else
            {
                unitPrice = 0; // Package or custom product
            }

            var totalCents = unitPrice * itemReq.Quantity;
            subtotal += totalCents;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductVariationId = itemReq.ProductVariationId,
                ProductName = product.Name,
                VariationName = variation?.Name,
                Quantity = itemReq.Quantity,
                UnitPriceCents = unitPrice,
                TotalCents = totalCents,
                SelectedPhotoUrl = itemReq.SelectedPhotoUrl
            });
        }

        // Apply coupon discount
        long discount = 0;
        if (!string.IsNullOrEmpty(req.CouponCode))
        {
            var coupon = await _db.Coupons
                .FirstOrDefaultAsync(c => c.PhotographerId == photographerId
                    && c.Code == req.CouponCode.ToUpperInvariant()
                    && c.IsActive, ct);
            if (coupon is not null)
            {
                if (coupon.ExpirationDate is null || coupon.ExpirationDate > DateTime.UtcNow)
                {
                    if (coupon.UsageLimit is null || coupon.TimesUsed < coupon.UsageLimit)
                    {
                        if (coupon.MinimumOrderCents is null || subtotal >= coupon.MinimumOrderCents)
                        {
                            discount = coupon.CouponType switch
                            {
                                CouponType.PercentageOff => (long)(subtotal * (coupon.PercentageValue ?? 0) / 100),
                                CouponType.FixedAmountOff => coupon.FixedAmountCents ?? 0,
                                _ => 0
                            };
                            coupon.TimesUsed++;
                        }
                    }
                }
            }
        }

        // Apply gift card (STR-2.4.3)
        if (!string.IsNullOrEmpty(req.GiftCardCode))
        {
            var gc = await _db.GiftCards
                .FirstOrDefaultAsync(g => g.PhotographerId == photographerId
                    && g.Code == req.GiftCardCode.ToUpperInvariant()
                    && g.IsActive
                    && g.BalanceCents > 0, ct);
            if (gc is not null)
            {
                var amountAfterCoupon = subtotal - discount;
                var gcDeduction = Math.Min(gc.BalanceCents, amountAfterCoupon);
                discount += gcDeduction;
                gc.BalanceCents -= gcDeduction;
            }
        }

        // Calculate shipping
        long shippingCents = 0;
        if (req.ShippingMethodId.HasValue)
        {
            var sm = await _db.ShippingMethods
                .FirstOrDefaultAsync(s => s.Id == req.ShippingMethodId && s.PhotographerId == photographerId, ct);
            if (sm is not null)
                shippingCents = sm.CostCents;
        }

        // Calculate tax (STR-2.5.2)
        long taxCents = 0;
        if (!string.IsNullOrEmpty(req.ShippingProvince))
        {
            var taxRate = await _db.TaxRates
                .FirstOrDefaultAsync(t => t.PhotographerId == photographerId
                    && t.Region == req.ShippingProvince
                    && t.IsActive, ct);
            if (taxRate is not null)
            {
                taxCents = (long)((subtotal - discount) * taxRate.Percentage / 100);
            }
        }

        var total = subtotal - discount + shippingCents + taxCents;
        var commission = (long)(subtotal * commissionPct / 100);

        order.SubtotalCents = subtotal;
        order.DiscountCents = discount;
        order.ShippingCents = shippingCents;
        order.TaxCents = taxCents;
        order.TotalCents = total;
        order.CommissionCents = commission;
        order.Status = OrderStatus.Pending;

        // Generate Interac e-Transfer payment reference for store checkout (INT-20.2.2)
        if (req.PaymentMethod == PaymentMethod.InteracETransfer)
        {
            order.InteracPaymentReference = $"ANANSI-ORD-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        return Result<OrderDto>.Success(MapOrderToDto(order));
    }

    private static OrderDto MapOrderToDto(Order o) => new(
        o.Id, o.ClientName, o.ClientEmail, o.ClientPhone,
        o.ShippingAddress, o.ShippingCity, o.ShippingProvince,
        o.ShippingPostalCode, o.ShippingCountry,
        o.Status, o.PaymentMethod, o.FulfillmentType, o.LabPartner,
        o.SubtotalCents, o.TaxCents, o.ShippingCents, o.DiscountCents,
        o.TotalCents, o.CommissionCents, o.CommissionPercentage,
        o.CouponCode, o.GiftCardCode, o.TrackingNumber, o.TrackingUrl,
        o.InteracPaymentReference,
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.ProductName, i.ProductVariationId,
            i.VariationName, i.Quantity, i.UnitPriceCents,
            i.TotalCents, i.SelectedPhotoUrl)).ToList(),
        o.CreatedAt, o.UpdatedAt);
}
