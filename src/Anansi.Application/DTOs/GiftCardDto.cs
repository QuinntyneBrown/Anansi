namespace Anansi.Application.DTOs;

public record GiftCardDto(
    Guid Id,
    string Code,
    long OriginalAmountCents,
    long BalanceCents,
    DateTime? ExpiryDate,
    string? RecipientEmail,
    string? RecipientName,
    string? SenderName,
    string? Message,
    bool IsActive,
    DateTime CreatedAt);
