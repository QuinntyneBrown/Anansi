using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Questionnaires;

/// <summary>
/// Submit a response to a questionnaire (QST-4.7.3).
/// </summary>
public record SubmitQuestionnaireResponseCommand(
    Guid QuestionnaireId,
    string? RespondentEmail,
    string? RespondentName,
    string AnswersJson) : IRequest<Result<QuestionnaireResponseDto>>;

public class SubmitQuestionnaireResponseHandler : IRequestHandler<SubmitQuestionnaireResponseCommand, Result<QuestionnaireResponseDto>>
{
    private readonly IApplicationDbContext _db;

    public SubmitQuestionnaireResponseHandler(IApplicationDbContext db) => _db = db;

    public async Task<Result<QuestionnaireResponseDto>> Handle(SubmitQuestionnaireResponseCommand request, CancellationToken ct)
    {
        var questionnaire = await _db.Set<Questionnaire>()
            .FirstOrDefaultAsync(q => q.Id == request.QuestionnaireId, ct);

        if (questionnaire is null) return Result<QuestionnaireResponseDto>.NotFound("Questionnaire not found");

        if (questionnaire.Status == QuestionnaireStatus.Expired)
            return Result<QuestionnaireResponseDto>.Failure("Questionnaire has expired.");

        if (questionnaire.Status == QuestionnaireStatus.Completed && !questionnaire.AllowMultipleSubmissions)
            return Result<QuestionnaireResponseDto>.Failure("Questionnaire has already been completed.");

        var response = new QuestionnaireResponse
        {
            QuestionnaireId = questionnaire.Id,
            RespondentEmail = request.RespondentEmail,
            RespondentName = request.RespondentName,
            AnswersJson = request.AnswersJson
        };

        _db.Set<QuestionnaireResponse>().Add(response);

        if (!questionnaire.AllowMultipleSubmissions)
        {
            questionnaire.Status = QuestionnaireStatus.Completed;
            questionnaire.CompletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        return Result<QuestionnaireResponseDto>.Success(
            new QuestionnaireResponseDto(response.Id, response.QuestionnaireId, response.ContactId,
                response.RespondentEmail, response.RespondentName, response.AnswersJson, response.SubmittedAt));
    }
}
