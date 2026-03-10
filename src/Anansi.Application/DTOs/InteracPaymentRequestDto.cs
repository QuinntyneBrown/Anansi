using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record InteracPaymentRequestDto(
    Guid Id,
    Guid InvoiceId,
    string? InvoiceNumber,
    long AmountCents,
    string PaymentReference,
    string RecipientEmail,
    string? ClientEmail,
    InteracPaymentStatus Status,
    DateTime ExpiresAt,
    DateTime? ConfirmedAt,
    DateTime CreatedAt);

public record InteracConfigDto(
    string? InteracEmail,
    bool IsEnabled);
