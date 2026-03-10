using Anansi.Application.Features.CRM.Projects;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProjectsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("board")]
    public async Task<IActionResult> GetBoard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProjectBoardQuery(), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProjectCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/projects/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}/move")]
    public async Task<IActionResult> Move(Guid id, MoveProjectCommand command, CancellationToken ct)
    {
        if (id != command.ProjectId)
        {
            command = command with { ProjectId = id };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("stages")]
    public async Task<IActionResult> CreateStage(CreateStageCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/projects/stages/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpPut("stages/{id:guid}")]
    public async Task<IActionResult> UpdateStage(Guid id, UpdateStageCommand command, CancellationToken ct)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("stages/{id:guid}")]
    public async Task<IActionResult> DeleteStage(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteStageCommand(id), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
