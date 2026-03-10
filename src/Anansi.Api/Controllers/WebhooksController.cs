using Anansi.Application.Features.Integrations.Commands;
using Anansi.Application.Features.Integrations.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WebhooksController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebhooksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetWebhookSubscriptions()
    {
        var result = await _mediator.Send(new GetWebhookSubscriptionsQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWebhookSubscription([FromBody] CreateWebhookSubscriptionCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return CreatedAtAction(nameof(GetWebhookSubscriptions), new { id = result.Value });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWebhookSubscription(Guid id)
    {
        var result = await _mediator.Send(new DeleteWebhookSubscriptionCommand(id));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return NoContent();
    }
}
