using Anansi.Application.Features.Website.Elements;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.1.2 Flex Editor: elements with drag-and-drop, breakpoint customization, layers.
/// WEB-3.2.2 Client Gallery Blocks, WEB-3.2.3 Instagram Feed,
/// WEB-3.2.4 Custom Embed Code, WEB-3.2.5 Landing Page Templates.
/// </summary>
[ApiController]
[Route("api/pages/{pageId:guid}/elements")]
[Authorize]
public class PageElementsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PageElementsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid pageId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListElementsQuery(pageId), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid pageId, [FromBody] CreateElementCommand command, CancellationToken ct)
    {
        if (pageId != command.PageId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"api/pages/{pageId}/elements/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{elementId:guid}")]
    public async Task<IActionResult> Update(Guid pageId, Guid elementId, [FromBody] UpdateElementCommand command, CancellationToken ct)
    {
        if (elementId != command.ElementId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("{elementId:guid}")]
    public async Task<IActionResult> Delete(Guid pageId, Guid elementId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteElementCommand(elementId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
