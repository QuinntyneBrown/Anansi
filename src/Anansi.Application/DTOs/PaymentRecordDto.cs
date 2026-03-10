using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record PaymentRecordDto(
    Guid Id,
    Guid? ContactId,
    Guid? InvoiceId,
    Guid? BookingId,
    long AmountCents,
    long FeeCents,
    long NetAmountCents,
    long TipCents,
    long TaxCents,
    string Currency,
    PaymentMethod PaymentMethod,
    string? ExternalPaymentId,
    string? CardLast4,
    string? Description,
    bool IsOffline,
    bool IsRefund,
    DateTime CreatedAt);
