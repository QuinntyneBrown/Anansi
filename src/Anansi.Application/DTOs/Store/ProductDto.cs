using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs.Store;

public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    ProductType ProductType,
    FulfillmentType FulfillmentType,
    bool IsActive,
    LabPartner? LabPartner,
    bool LabColorCorrectionEnabled,
    string? PreviewImageUrl,
    string? DigitalResolutionOptions,
    List<ProductVariationDto> Variations,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProductVariationDto(
    Guid Id,
    string Name,
    string? Sku,
    long CostCents,
    long MarkupCents,
    long PriceCents,
    bool IsCustomPriced,
    bool IsActive);

public record CreateProductRequest(
    string Name,
    string? Description,
    ProductType ProductType,
    FulfillmentType FulfillmentType,
    LabPartner? LabPartner,
    bool LabColorCorrectionEnabled,
    string? PreviewImageUrl,
    string? DigitalResolutionOptions,
    List<CreateProductVariationRequest>? Variations);

public record CreateProductVariationRequest(
    string Name,
    string? Sku,
    long CostCents,
    long MarkupCents,
    long PriceCents);

public record UpdateProductRequest(
    string Name,
    string? Description,
    bool IsActive,
    LabPartner? LabPartner,
    bool LabColorCorrectionEnabled,
    string? PreviewImageUrl,
    string? DigitalResolutionOptions);

public record BulkMarkupRequest(
    ProductType ProductType,
    decimal MarkupPercentage,
    bool OverrideCustomPriced);

public record PackageItemDto(
    Guid Id,
    Guid IncludedProductId,
    string IncludedProductName,
    Guid? IncludedVariationId,
    string? IncludedVariationName,
    int Quantity);

public record CreatePackageItemRequest(
    Guid IncludedProductId,
    Guid? IncludedVariationId,
    int Quantity);
