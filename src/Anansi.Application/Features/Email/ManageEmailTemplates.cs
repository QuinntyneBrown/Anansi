using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Email;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Email;

/// <summary>
/// Create an email template (EML-5.2.1, EML-5.2.2, EML-5.2.3).
/// </summary>
public record CreateEmailTemplateCommand(
    string Name,
    string Category,
    string? SubjectLine,
    string Body,
    string? HtmlBody,
    string? HeaderImageUrl,
    bool UseBranding) : IRequest<Result<EmailTemplateDto>>;

public class CreateEmailTemplateValidator : AbstractValidator<CreateEmailTemplateCommand>
{
    public CreateEmailTemplateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Body).NotEmpty();
    }
}

public class CreateEmailTemplateHandler : IRequestHandler<CreateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateEmailTemplateHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EmailTemplateDto>> Handle(CreateEmailTemplateCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var template = new EmailTemplate
        {
            PhotographerId = photographerId,
            Name = request.Name,
            Category = request.Category,
            SubjectLine = request.SubjectLine,
            Body = request.Body,
            HtmlBody = request.HtmlBody,
            HeaderImageUrl = request.HeaderImageUrl,
            UseBranding = request.UseBranding
        };

        _db.Set<EmailTemplate>().Add(template);
        await _db.SaveChangesAsync(ct);

        return Result<EmailTemplateDto>.Success(MapToDto(template));
    }

    internal static EmailTemplateDto MapToDto(EmailTemplate t) =>
        new(t.Id, t.Name, t.Category, t.SubjectLine, t.Body, t.HtmlBody, t.HeaderImageUrl, t.UseBranding, t.CreatedAt);
}

/// <summary>
/// List email templates (EML-5.2.1, EML-5.2.2).
/// </summary>
public record ListEmailTemplatesQuery(string? Category) : IRequest<Result<IReadOnlyList<EmailTemplateDto>>>;

public class ListEmailTemplatesHandler : IRequestHandler<ListEmailTemplatesQuery, Result<IReadOnlyList<EmailTemplateDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListEmailTemplatesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<EmailTemplateDto>>> Handle(ListEmailTemplatesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<EmailTemplate>()
            .Where(t => t.PhotographerId == photographerId);

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(t => t.Category == request.Category);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => CreateEmailTemplateHandler.MapToDto(t))
            .ToListAsync(ct);

        return Result<IReadOnlyList<EmailTemplateDto>>.Success(items);
    }
}
