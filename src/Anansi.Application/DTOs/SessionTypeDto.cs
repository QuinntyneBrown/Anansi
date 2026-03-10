using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record SessionTypeDto(
    Guid Id,
    string Name,
    string? Description,
    int DurationMinutes,
    long PriceCents,
    string? Location,
    SessionVisibility Visibility,
    int SortOrder,
    int BufferBeforeMinutes,
    int BufferAfterMinutes,
    bool RequireManualConfirmation,
    bool IsMiniSession,
    int MiniSessionGapMinutes,
    int MiniSessionSpotsPerSlot,
    string? AvailabilityWindows,
    string? VideoCallType,
    bool RequirePayment,
    long? DepositAmountCents,
    string? IntakeDocumentIds,
    string? CoverImageUrl,
    Guid? CommunityEventId,
    DateTime CreatedAt);
