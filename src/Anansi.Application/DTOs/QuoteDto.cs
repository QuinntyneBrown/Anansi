using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record QuoteDto(
    Guid Id,
    string Title,
    Guid? ContactId,
    string? ContactName,
    QuoteStatus Status,
    long TotalCents,
    DateTime? SentAt,
    DateTime? AcceptedAt,
    Guid? GeneratedInvoiceId,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<QuoteItemDto> Items,
    DateTime CreatedAt);

public record QuoteItemDto(
    Guid Id,
    string Name,
    string? Description,
    int Quantity,
    long UnitPriceCents,
    long TotalCents,
    int SortOrder);
