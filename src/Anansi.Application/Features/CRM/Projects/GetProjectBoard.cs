using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Projects;

/// <summary>
/// Get the full Kanban board with all stages and project cards (CRM-4.2.1, CRM-4.2.2).
/// </summary>
public record GetProjectBoardQuery : IRequest<Result<IReadOnlyList<ProjectStageDto>>>;

public class GetProjectBoardHandler : IRequestHandler<GetProjectBoardQuery, Result<IReadOnlyList<ProjectStageDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetProjectBoardHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<ProjectStageDto>>> Handle(GetProjectBoardQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var stages = await _db.Set<ProjectStage>()
            .Where(s => s.PhotographerId == photographerId)
            .OrderBy(s => s.SortOrder)
            .Include(s => s.Projects.Where(p => !p.IsDeleted))
                .ThenInclude(p => p.Contact)
            .ToListAsync(ct);

        // Auto-create default stages if none exist
        if (stages.Count == 0)
        {
            var defaults = new[] { "Inquiry", "Booked Session", "Post-production", "Completed Project" };
            for (int i = 0; i < defaults.Length; i++)
            {
                var stage = new ProjectStage { PhotographerId = photographerId, Name = defaults[i], SortOrder = i };
                _db.Set<ProjectStage>().Add(stage);
                stages.Add(stage);
            }
            await _db.SaveChangesAsync(ct);
        }

        var result = stages.Select(s => new ProjectStageDto(
            s.Id, s.Name, s.SortOrder,
            s.Projects.OrderBy(p => p.SortOrder).Select(p => new ProjectDto(
                p.Id, p.Name, p.ProjectType, p.StageId, s.Name,
                p.ContactId, p.Contact != null ? $"{p.Contact.FirstName} {p.Contact.LastName}" : null,
                p.SortOrder, p.CreatedAt
            )).ToList()
        )).ToList();

        return Result<IReadOnlyList<ProjectStageDto>>.Success(result);
    }
}
