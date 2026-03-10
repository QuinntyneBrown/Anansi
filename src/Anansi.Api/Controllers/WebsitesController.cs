using Anansi.Application.Features.Website.Analytics;
using Anansi.Application.Features.Website.Hosting;
using Anansi.Application.Features.Website.Sites;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.1.1 through WEB-3.7.3 - Website management, publishing, hosting, analytics.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WebsitesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsitesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] WebsiteStatus? status, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListWebsitesQuery(status), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetWebsiteQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWebsiteCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value!.Id }, result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWebsiteCommand command, CancellationToken ct)
    {
        if (id != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new PublishWebsiteCommand(id), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteWebsiteCommand(id), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}/custom-domain")]
    public async Task<IActionResult> ConfigureCustomDomain(Guid id, [FromBody] ConfigureWebsiteCustomDomainCommand command, CancellationToken ct)
    {
        if (id != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("{id:guid}/analytics")]
    public async Task<IActionResult> GetAnalytics(Guid id, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetWebsiteAnalyticsQuery(id, startDate, endDate), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
