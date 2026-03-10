using Anansi.Application.Common;
using Anansi.Application.Features.Galleries.Presets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/collection-presets")]
[Authorize]
public class CollectionPresetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CollectionPresetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List() =>
        ToResult(await _mediator.Send(new ListPresetsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePresetCommand command) =>
        ToResult(await _mediator.Send(command));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePresetCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        return ToResult(await _mediator.Send(command));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) =>
        ToResult(await _mediator.Send(new DeletePresetCommand(id)));

    private IActionResult ToResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, new { error = result.Error });

    private IActionResult ToResult(Result result) =>
        result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, new { error = result.Error });
}
