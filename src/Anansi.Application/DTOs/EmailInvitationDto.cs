namespace Anansi.Application.DTOs;

public record EmailInvitationDto(
    Guid Id,
    Guid CollectionId,
    string RecipientEmail,
    string Subject,
    string Body,
    string? HeaderImageUrl,
    bool IncludePassword,
    bool IsSent,
    DateTime? SentAt,
    bool IsOpened,
    DateTime? OpenedAt,
    DateTime CreatedAt
);
