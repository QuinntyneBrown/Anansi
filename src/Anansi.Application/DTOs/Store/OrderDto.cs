using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Store;

public record OrderDto(
    Guid Id,
    string ClientName,
    string ClientEmail,
    string? ClientPhone,
    string? ShippingAddress,
    string? ShippingCity,
    string? ShippingProvince,
    string? ShippingPostalCode,
    string? ShippingCountry,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    FulfillmentType FulfillmentType,
    LabPartner? LabPartner,
    long SubtotalCents,
    long TaxCents,
    long ShippingCents,
    long DiscountCents,
    long TotalCents,
    long CommissionCents,
    decimal CommissionPercentage,
    string? CouponCode,
    string? GiftCardCode,
    string? TrackingNumber,
    string? TrackingUrl,
    List<OrderItemDto> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid? ProductVariationId,
    string? VariationName,
    int Quantity,
    long UnitPriceCents,
    long TotalCents,
    string? SelectedPhotoUrl);

public record CreateOrderRequest(
    string ClientName,
    string ClientEmail,
    string? ClientPhone,
    string? ShippingAddress,
    string? ShippingCity,
    string? ShippingProvince,
    string? ShippingPostalCode,
    string? ShippingCountry,
    PaymentMethod PaymentMethod,
    Guid? ShippingMethodId,
    string? CouponCode,
    string? GiftCardCode,
    List<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(
    Guid ProductId,
    Guid? ProductVariationId,
    int Quantity,
    string? SelectedPhotoUrl);

public record UpdateOrderStatusRequest(
    OrderStatus Status,
    string? TrackingNumber,
    string? TrackingUrl);
