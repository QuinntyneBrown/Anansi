namespace Anansi.Application.DTOs.Store;

public record ShippingMethodDto(
    Guid Id,
    string Name,
    string? Description,
    long CostCents,
    string? EstimatedDelivery,
    bool IsActive);

public record CreateShippingMethodRequest(
    string Name,
    string? Description,
    long CostCents,
    string? EstimatedDelivery);

public record UpdateShippingMethodRequest(
    string Name,
    string? Description,
    long CostCents,
    string? EstimatedDelivery,
    bool IsActive);
