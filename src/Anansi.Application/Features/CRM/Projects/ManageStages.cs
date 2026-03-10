using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Projects;

/// <summary>
/// Create a new project stage (CRM-4.2.1).
/// </summary>
public record CreateStageCommand(string Name, int SortOrder) : IRequest<Result<ProjectStageDto>>;

public class CreateStageValidator : AbstractValidator<CreateStageCommand>
{
    public CreateStageValidator() { RuleFor(x => x.Name).NotEmpty().MaximumLength(200); }
}

public class CreateStageHandler : IRequestHandler<CreateStageCommand, Result<ProjectStageDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateStageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ProjectStageDto>> Handle(CreateStageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var stage = new ProjectStage
        {
            PhotographerId = photographerId,
            Name = request.Name,
            SortOrder = request.SortOrder
        };

        _db.Set<ProjectStage>().Add(stage);
        await _db.SaveChangesAsync(ct);

        return Result<ProjectStageDto>.Success(new ProjectStageDto(stage.Id, stage.Name, stage.SortOrder, new List<ProjectDto>()));
    }
}

/// <summary>
/// Update stages (rename, reorder) (CRM-4.2.1).
/// </summary>
public record UpdateStageCommand(Guid Id, string Name, int SortOrder) : IRequest<Result>;

public class UpdateStageHandler : IRequestHandler<UpdateStageCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateStageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(UpdateStageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var stage = await _db.Set<ProjectStage>()
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.PhotographerId == photographerId, ct);
        if (stage is null) return Result.NotFound("Stage not found");

        stage.Name = request.Name;
        stage.SortOrder = request.SortOrder;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

/// <summary>
/// Delete a stage (CRM-4.2.1).
/// </summary>
public record DeleteStageCommand(Guid Id) : IRequest<Result>;

public class DeleteStageHandler : IRequestHandler<DeleteStageCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteStageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteStageCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var stage = await _db.Set<ProjectStage>()
            .Include(s => s.Projects)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.PhotographerId == photographerId, ct);
        if (stage is null) return Result.NotFound("Stage not found");
        if (stage.Projects.Any()) return Result.Failure("Cannot delete a stage that has projects. Move them first.");

        _db.Set<ProjectStage>().Remove(stage);
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
