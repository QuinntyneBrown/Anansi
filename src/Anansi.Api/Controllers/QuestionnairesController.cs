using Anansi.Application.Features.CRM.Questionnaires;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionnairesController : ControllerBase
{
    private readonly IMediator _mediator;
    public QuestionnairesController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create(CreateQuestionnaireCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/questionnaires/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetQuestionnaireQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost("{id:guid}/responses")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitResponse(Guid id, SubmitQuestionnaireResponseCommand command, CancellationToken ct)
    {
        if (id != command.QuestionnaireId)
        {
            command = command with { QuestionnaireId = id };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
