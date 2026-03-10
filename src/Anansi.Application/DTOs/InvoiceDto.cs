using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record InvoiceDto(
    Guid Id,
    string InvoiceNumber,
    string Title,
    Guid? ContactId,
    string? ContactName,
    InvoiceStatus Status,
    DateTime? DueDate,
    long SubtotalCents,
    decimal TaxRatePercent,
    long TaxAmountCents,
    long DiscountCents,
    long TotalCents,
    long PaidCents,
    bool TipsEnabled,
    long TipAmountCents,
    long? DepositAmountCents,
    bool AutoRemindersEnabled,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<InvoiceLineItemDto> LineItems,
    IReadOnlyList<InvoicePaymentScheduleDto> PaymentSchedules,
    DateTime CreatedAt);

public record InvoiceLineItemDto(
    Guid Id,
    string Name,
    string? Description,
    int Quantity,
    long UnitPriceCents,
    long TotalCents,
    int SortOrder);

public record InvoicePaymentScheduleDto(
    Guid Id,
    string Label,
    long AmountCents,
    DateTime DueDate,
    bool IsPaid,
    DateTime? PaidAt,
    int SortOrder);
