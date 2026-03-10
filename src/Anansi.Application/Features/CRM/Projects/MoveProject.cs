using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Projects;

/// <summary>
/// Move a project card to a different stage (drag-and-drop) (CRM-4.2.1).
/// </summary>
public record MoveProjectCommand(Guid ProjectId, Guid NewStageId, int NewSortOrder) : IRequest<Result>;

public class MoveProjectHandler : IRequestHandler<MoveProjectCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MoveProjectHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(MoveProjectCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var project = await _db.Set<Project>()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.PhotographerId == photographerId, ct);

        if (project is null) return Result.NotFound("Project not found");

        var stage = await _db.Set<ProjectStage>()
            .FirstOrDefaultAsync(s => s.Id == request.NewStageId && s.PhotographerId == photographerId, ct);

        if (stage is null) return Result.NotFound("Stage not found");

        project.StageId = request.NewStageId;
        project.SortOrder = request.NewSortOrder;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
