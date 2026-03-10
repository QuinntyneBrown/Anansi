using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Questionnaires;

public record GetQuestionnaireQuery(Guid Id) : IRequest<Result<QuestionnaireDto>>;

public class GetQuestionnaireHandler : IRequestHandler<GetQuestionnaireQuery, Result<QuestionnaireDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetQuestionnaireHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<QuestionnaireDto>> Handle(GetQuestionnaireQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var questionnaire = await _db.Set<Questionnaire>()
            .Include(q => q.Questions)
            .Include(q => q.Contact)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.PhotographerId == photographerId, ct);

        if (questionnaire is null) return Result<QuestionnaireDto>.NotFound("Questionnaire not found");
        return Result<QuestionnaireDto>.Success(CreateQuestionnaireHandler.MapToDto(questionnaire));
    }
}
