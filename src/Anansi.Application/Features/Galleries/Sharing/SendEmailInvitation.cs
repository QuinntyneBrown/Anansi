using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Sharing;

// GAL-1.7.1: Email Invitations
public record SendEmailInvitationCommand(
    Guid CollectionId,
    string RecipientEmail,
    string Subject,
    string Body,
    string? HeaderImageUrl,
    bool IncludePassword
) : IRequest<Result<EmailInvitationDto>>;

public class SendEmailInvitationValidator : AbstractValidator<SendEmailInvitationCommand>
{
    public SendEmailInvitationValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.RecipientEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Body).NotEmpty().MaximumLength(10000);
    }
}

public class SendEmailInvitationHandler : IRequestHandler<SendEmailInvitationCommand, Result<EmailInvitationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;

    public SendEmailInvitationHandler(IApplicationDbContext db, ICurrentUserService currentUser, IEmailService emailService)
    {
        _db = db;
        _currentUser = currentUser;
        _emailService = emailService;
    }

    public async Task<Result<EmailInvitationDto>> Handle(SendEmailInvitationCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<EmailInvitationDto>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<EmailInvitationDto>.NotFound("Collection not found");

        var body = request.Body;
        if (request.IncludePassword && !string.IsNullOrEmpty(collection.Password))
        {
            body += $"\n\nPassword: {collection.Password}";
        }

        var invitation = new EmailInvitation
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            CollectionId = request.CollectionId,
            RecipientEmail = request.RecipientEmail,
            Subject = request.Subject,
            Body = body,
            HeaderImageUrl = request.HeaderImageUrl,
            IncludePassword = request.IncludePassword
        };

        try
        {
            await _emailService.SendAsync(request.RecipientEmail, request.Subject, body, ct);
            invitation.IsSent = true;
            invitation.SentAt = DateTime.UtcNow;
        }
        catch
        {
            // Email failed to send, but still track the invitation
            invitation.IsSent = false;
        }

        _db.EmailInvitations.Add(invitation);
        await _db.SaveChangesAsync(ct);

        return Result<EmailInvitationDto>.Success(new EmailInvitationDto(
            invitation.Id, invitation.CollectionId, invitation.RecipientEmail,
            invitation.Subject, invitation.Body, invitation.HeaderImageUrl,
            invitation.IncludePassword, invitation.IsSent, invitation.SentAt,
            invitation.IsOpened, invitation.OpenedAt, invitation.CreatedAt
        ));
    }
}
