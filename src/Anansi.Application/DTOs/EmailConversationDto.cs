namespace Anansi.Application.DTOs;

public record EmailConversationDto(
    Guid Id,
    Guid? ContactId,
    string Subject,
    string? ClientEmail,
    string? ClientName,
    bool IsRead,
    DateTime? LastMessageAt,
    IReadOnlyList<EmailMessageDto> Messages,
    DateTime CreatedAt);

public record EmailMessageDto(
    Guid Id,
    bool IsFromPhotographer,
    string SenderEmail,
    string? SenderName,
    string Body,
    bool IsRead,
    DateTime SentAt,
    IReadOnlyList<EmailAttachmentDto> Attachments);

public record EmailAttachmentDto(
    Guid Id,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    string StorageUrl);
