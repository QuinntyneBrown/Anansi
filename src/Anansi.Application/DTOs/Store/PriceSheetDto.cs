namespace Anansi.Application.DTOs.Store;

public record PriceSheetDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsDownloadOnly,
    bool IsDefault,
    List<PriceSheetItemDto> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record PriceSheetItemDto(
    Guid Id,
    Guid ProductVariationId,
    string ProductVariationName,
    long PriceCents);

public record CreatePriceSheetRequest(
    string Name,
    string? Description,
    bool IsDownloadOnly,
    bool IsDefault,
    List<CreatePriceSheetItemRequest>? Items);

public record CreatePriceSheetItemRequest(
    Guid ProductVariationId,
    long PriceCents);

public record UpdatePriceSheetRequest(
    string Name,
    string? Description,
    bool IsDownloadOnly,
    bool IsDefault);
