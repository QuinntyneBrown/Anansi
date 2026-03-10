using Anansi.Application.Features.Website.Pages;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.2.1 Page Management, WEB-3.5.1/3.5.3/3.5.5 SEO per page.
/// </summary>
[ApiController]
[Route("api/websites/{websiteId:guid}/pages")]
[Authorize]
public class WebsitePagesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsitePagesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid websiteId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListPagesQuery(websiteId), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid websiteId, [FromBody] CreatePageCommand command, CancellationToken ct)
    {
        if (websiteId != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"api/websites/{websiteId}/pages/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{pageId:guid}")]
    public async Task<IActionResult> Update(Guid websiteId, Guid pageId, [FromBody] UpdatePageCommand command, CancellationToken ct)
    {
        if (pageId != command.PageId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("{pageId:guid}")]
    public async Task<IActionResult> Delete(Guid websiteId, Guid pageId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletePageCommand(pageId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
