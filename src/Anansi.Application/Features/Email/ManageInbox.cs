using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Email;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Email;

/// <summary>
/// List all conversations in the unified inbox (EML-5.1.1).
/// </summary>
public record ListConversationsQuery(int Page = 1, int PageSize = 25) : IRequest<Result<PagedList<EmailConversationDto>>>;

public class ListConversationsHandler : IRequestHandler<ListConversationsQuery, Result<PagedList<EmailConversationDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListConversationsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<EmailConversationDto>>> Handle(ListConversationsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<EmailConversation>()
            .Where(c => c.PhotographerId == photographerId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(c => c.Messages)
                .ThenInclude(m => m.Attachments)
            .ToListAsync(ct);

        var dtos = items.Select(c => new EmailConversationDto(
            c.Id, c.ContactId, c.Subject, c.ClientEmail, c.ClientName, c.IsRead, c.LastMessageAt,
            c.Messages.OrderBy(m => m.SentAt).Select(m => new EmailMessageDto(
                m.Id, m.IsFromPhotographer, m.SenderEmail, m.SenderName, m.Body, m.IsRead, m.SentAt,
                m.Attachments.Select(a => new EmailAttachmentDto(a.Id, a.FileName, a.ContentType, a.FileSizeBytes, a.StorageUrl)).ToList()
            )).ToList(),
            c.CreatedAt
        )).ToList();

        return Result<PagedList<EmailConversationDto>>.Success(
            new PagedList<EmailConversationDto>(dtos, total, request.Page, request.PageSize));
    }
}

/// <summary>
/// Send a new message / create conversation (EML-5.1.1).
/// </summary>
public record SendEmailCommand(
    Guid? ConversationId,
    string? ToEmail,
    string? ToName,
    Guid? ContactId,
    string Subject,
    string Body,
    string? HtmlBody) : IRequest<Result<EmailConversationDto>>;

public class SendEmailValidator : AbstractValidator<SendEmailCommand>
{
    public SendEmailValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Body).NotEmpty();
    }
}

public class SendEmailHandler : IRequestHandler<SendEmailCommand, Result<EmailConversationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SendEmailHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EmailConversationDto>> Handle(SendEmailCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        EmailConversation conversation;
        if (request.ConversationId.HasValue)
        {
            conversation = await _db.Set<EmailConversation>()
                .Include(c => c.Messages).ThenInclude(m => m.Attachments)
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId && c.PhotographerId == photographerId, ct)
                ?? throw new InvalidOperationException("Conversation not found");
        }
        else
        {
            conversation = new EmailConversation
            {
                PhotographerId = photographerId,
                Subject = request.Subject,
                ClientEmail = request.ToEmail,
                ClientName = request.ToName,
                ContactId = request.ContactId
            };
            _db.Set<EmailConversation>().Add(conversation);
        }

        var message = new EmailMessage
        {
            ConversationId = conversation.Id,
            IsFromPhotographer = true,
            SenderEmail = "photographer@studio.com", // Would come from Photographer entity
            SenderName = "Photographer",
            Body = request.Body,
            HtmlBody = request.HtmlBody,
            IsRead = true
        };

        _db.Set<EmailMessage>().Add(message);
        conversation.LastMessageAt = DateTime.UtcNow;
        conversation.IsRead = true;

        await _db.SaveChangesAsync(ct);

        // Re-load conversation with all messages for the response
        var loaded = await _db.Set<EmailConversation>()
            .Include(c => c.Messages).ThenInclude(m => m.Attachments)
            .FirstAsync(c => c.Id == conversation.Id, ct);

        return Result<EmailConversationDto>.Success(new EmailConversationDto(
            loaded.Id, loaded.ContactId, loaded.Subject,
            loaded.ClientEmail, loaded.ClientName, loaded.IsRead, loaded.LastMessageAt,
            loaded.Messages.OrderBy(m => m.SentAt).Select(m => new EmailMessageDto(
                m.Id, m.IsFromPhotographer, m.SenderEmail, m.SenderName, m.Body, m.IsRead, m.SentAt,
                m.Attachments.Select(a => new EmailAttachmentDto(a.Id, a.FileName, a.ContentType, a.FileSizeBytes, a.StorageUrl)).ToList()
            )).ToList(),
            loaded.CreatedAt
        ));
    }
}
