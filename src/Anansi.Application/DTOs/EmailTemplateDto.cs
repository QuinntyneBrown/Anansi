namespace Anansi.Application.DTOs;

public record EmailTemplateDto(
    Guid Id,
    string Name,
    string Category,
    string? SubjectLine,
    string Body,
    string? HtmlBody,
    string? HeaderImageUrl,
    bool UseBranding,
    DateTime CreatedAt);
