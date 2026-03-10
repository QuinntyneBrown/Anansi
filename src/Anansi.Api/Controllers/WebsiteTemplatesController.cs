using Anansi.Application.Features.Website.Templates;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.1.1 Template Library, WEB-3.2.5 Landing Page Templates.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class WebsiteTemplatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsiteTemplatesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] TemplateCategory? category, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListTemplatesQuery(category), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("{id:guid}/preview")]
    public async Task<IActionResult> Preview(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTemplatePreviewQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("landing-pages")]
    public async Task<IActionResult> ListLandingPages(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListLandingPageTemplatesQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
