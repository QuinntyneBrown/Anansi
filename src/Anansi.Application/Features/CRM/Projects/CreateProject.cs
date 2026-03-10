using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Projects;

public record CreateProjectCommand(
    string Name,
    string? ProjectType,
    Guid StageId,
    Guid? ContactId) : IRequest<Result<ProjectDto>>;

public class CreateProjectValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.StageId).NotEmpty();
    }
}

public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, Result<ProjectDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateProjectHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ProjectDto>> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var stage = await _db.Set<ProjectStage>()
            .FirstOrDefaultAsync(s => s.Id == request.StageId && s.PhotographerId == photographerId, ct);

        if (stage is null) return Result<ProjectDto>.NotFound("Stage not found");

        var project = new Project
        {
            PhotographerId = photographerId,
            Name = request.Name,
            ProjectType = request.ProjectType,
            StageId = request.StageId,
            ContactId = request.ContactId
        };

        _db.Set<Project>().Add(project);
        await _db.SaveChangesAsync(ct);

        return Result<ProjectDto>.Success(new ProjectDto(
            project.Id, project.Name, project.ProjectType, project.StageId, stage.Name,
            project.ContactId, null, project.SortOrder, project.CreatedAt));
    }
}
