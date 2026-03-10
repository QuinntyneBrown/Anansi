using Anansi.Application.Features.Email;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmailController : ControllerBase
{
    private readonly IMediator _mediator;
    public EmailController(IMediator mediator) => _mediator = mediator;

    [HttpGet("conversations")]
    public async Task<IActionResult> ListConversations([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListConversationsQuery(page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send(SendEmailCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate(CreateEmailTemplateCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/email/templates/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("templates")]
    public async Task<IActionResult> ListTemplates([FromQuery] string? category, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListEmailTemplatesQuery(category), ct);
        return Ok(result.Value);
    }

    [HttpPost("automated-configs")]
    public async Task<IActionResult> UpsertAutomatedConfig(UpsertAutomatedEmailConfigCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("automated-configs")]
    public async Task<IActionResult> ListAutomatedConfigs(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListAutomatedEmailConfigsQuery(), ct);
        return Ok(result.Value);
    }
}
