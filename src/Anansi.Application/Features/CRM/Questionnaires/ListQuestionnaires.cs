using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Questionnaires;

public record ListQuestionnairesQuery(
    QuestionnaireStatus? Status = null,
    string? Search = null,
    bool? IsTemplate = null,
    int Page = 1,
    int PageSize = 25) : IRequest<Result<PagedList<QuestionnaireDto>>>;

public class ListQuestionnairesHandler : IRequestHandler<ListQuestionnairesQuery, Result<PagedList<QuestionnaireDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListQuestionnairesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<QuestionnaireDto>>> Handle(ListQuestionnairesQuery request, CancellationToken ct)
    {
        if (!_currentUser.PhotographerId.HasValue)
        {
            return Result<PagedList<QuestionnaireDto>>.Forbidden("Not authenticated");
        }

        var photographerId = _currentUser.PhotographerId.Value;
        var query = _db.Set<Questionnaire>()
            .Include(q => q.Contact)
            .Include(q => q.Questions)
            .Where(q => q.PhotographerId == photographerId);

        if (request.Status.HasValue)
        {
            query = query.Where(q => q.Status == request.Status.Value);
        }

        if (request.IsTemplate.HasValue)
        {
            query = query.Where(q => q.IsTemplate == request.IsTemplate.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var pattern = $"%{request.Search.Trim()}%";
            query = query.Where(q =>
                EF.Functions.Like(q.Title, pattern) ||
                (q.Description != null && EF.Functions.Like(q.Description, pattern)) ||
                (q.Contact != null && (
                    EF.Functions.Like(q.Contact.FirstName, pattern) ||
                    EF.Functions.Like(q.Contact.LastName, pattern))));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return Result<PagedList<QuestionnaireDto>>.Success(
            new PagedList<QuestionnaireDto>(
                items.Select(CreateQuestionnaireHandler.MapToDto).ToList(),
                total,
                request.Page,
                request.PageSize));
    }
}
