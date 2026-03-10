using Anansi.Application.Features.Website.Seo;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.5.1 SEO Manager, WEB-3.5.2 AI Alt Text, WEB-3.5.3 AI Page Descriptions,
/// WEB-3.5.4 URL Redirects, WEB-3.5.5 Social Sharing Images.
/// </summary>
[ApiController]
[Route("api/websites/{websiteId:guid}/seo")]
[Authorize]
public class WebsiteSeoController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsiteSeoController(IMediator mediator) => _mediator = mediator;

    [HttpGet("audit")]
    public async Task<IActionResult> RunAudit(Guid websiteId, CancellationToken ct)
    {
        var result = await _mediator.Send(new RunSeoAuditQuery(websiteId), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("ai-alt-text")]
    public async Task<IActionResult> GenerateAltText([FromBody] GenerateAiAltTextCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("ai-description/{pageId:guid}")]
    public async Task<IActionResult> GenerateDescription(Guid pageId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GenerateAiDescriptionCommand(pageId), ct);
        return result.IsSuccess ? Ok(new { description = result.Value }) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("redirects")]
    public async Task<IActionResult> ListRedirects(Guid websiteId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListUrlRedirectsQuery(websiteId), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("redirects")]
    public async Task<IActionResult> CreateRedirect(Guid websiteId, [FromBody] CreateUrlRedirectCommand command, CancellationToken ct)
    {
        if (websiteId != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("redirects/{redirectId:guid}")]
    public async Task<IActionResult> UpdateRedirect(Guid redirectId, [FromBody] UpdateUrlRedirectCommand command, CancellationToken ct)
    {
        if (redirectId != command.RedirectId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("redirects/{redirectId:guid}")]
    public async Task<IActionResult> DeleteRedirect(Guid redirectId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteUrlRedirectCommand(redirectId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
