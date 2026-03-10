using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.CRM.Questionnaires;

public record CreateQuestionnaireCommand(
    string Title,
    string? Description,
    Guid? ContactId,
    Guid? ProjectId,
    bool AllowMultipleSubmissions,
    int? ExpiryDays,
    bool AutoRemindersEnabled,
    int? ReminderIntervalDays,
    bool IsTemplate,
    string? TemplateName,
    IReadOnlyList<CreateQuestionInput> Questions) : IRequest<Result<QuestionnaireDto>>;

public record CreateQuestionInput(string Label, QuestionType QuestionType, bool IsRequired, int SortOrder, string? Options);

public class CreateQuestionnaireValidator : AbstractValidator<CreateQuestionnaireCommand>
{
    public CreateQuestionnaireValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
    }
}

public class CreateQuestionnaireHandler : IRequestHandler<CreateQuestionnaireCommand, Result<QuestionnaireDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateQuestionnaireHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuestionnaireDto>> Handle(CreateQuestionnaireCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var questionnaire = new Questionnaire
        {
            PhotographerId = photographerId,
            Title = request.Title,
            Description = request.Description,
            ContactId = request.ContactId,
            ProjectId = request.ProjectId,
            AllowMultipleSubmissions = request.AllowMultipleSubmissions,
            ExpiryDays = request.ExpiryDays,
            AutoRemindersEnabled = request.AutoRemindersEnabled,
            ReminderIntervalDays = request.ReminderIntervalDays,
            IsTemplate = request.IsTemplate,
            TemplateName = request.TemplateName,
            PublicSlug = request.AllowMultipleSubmissions ? Guid.NewGuid().ToString("N")[..12] : null
        };

        foreach (var q in request.Questions)
        {
            questionnaire.Questions.Add(new QuestionnaireQuestion
            {
                Label = q.Label,
                QuestionType = q.QuestionType,
                IsRequired = q.IsRequired,
                SortOrder = q.SortOrder,
                Options = q.Options
            });
        }

        _db.Set<Questionnaire>().Add(questionnaire);
        await _db.SaveChangesAsync(ct);

        return Result<QuestionnaireDto>.Success(MapToDto(questionnaire));
    }

    internal static QuestionnaireDto MapToDto(Questionnaire q) =>
        new(q.Id, q.Title, q.Description, q.ContactId,
            q.Contact != null ? $"{q.Contact.FirstName} {q.Contact.LastName}" : null,
            q.Status, q.SentAt, q.CompletedAt, q.AllowMultipleSubmissions, q.PublicSlug,
            q.ExpiryDays, q.ExpiresAt, q.AutoRemindersEnabled, q.IsTemplate, q.TemplateName,
            q.Questions.OrderBy(qq => qq.SortOrder).Select(qq =>
                new QuestionnaireQuestionDto(qq.Id, qq.Label, qq.QuestionType, qq.IsRequired, qq.SortOrder, qq.Options)).ToList(),
            q.CreatedAt);
}
