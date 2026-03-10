using Anansi.Application.Features.Integrations.Commands;
using Anansi.Application.Features.Integrations.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IntegrationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public IntegrationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // INT-8.1.4 Google Analytics
    [HttpPut("google-analytics")]
    public async Task<IActionResult> ConfigureGoogleAnalytics([FromBody] ConfigureGoogleAnalyticsCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    // INT-8.1.5 Facebook Pixel
    [HttpPut("facebook-pixel")]
    public async Task<IActionResult> ConfigureFacebookPixel([FromBody] ConfigureFacebookPixelCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    // INT-8.1.6 Instagram Feed
    [HttpPut("instagram")]
    public async Task<IActionResult> ConfigureInstagramFeed([FromBody] ConfigureInstagramFeedCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpGet("instagram/feed/{photographerId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInstagramFeed(Guid photographerId)
    {
        var result = await _mediator.Send(new GetInstagramFeedQuery(photographerId));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    // INT-8.1.7 Stripe
    [HttpPost("stripe")]
    public async Task<IActionResult> ConfigureStripe([FromBody] ConfigureStripeCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(new { stripeAccountId = result.Value });
    }

    // INT-8.1.8 PayPal
    [HttpPut("paypal")]
    public async Task<IActionResult> ConfigurePayPal([FromBody] ConfigurePayPalCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    // INT-8.3.2 Custom Code Injection
    [HttpPost("code-injection")]
    public async Task<IActionResult> SaveCodeInjection([FromBody] SaveCustomCodeInjectionCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(new { id = result.Value });
    }

    [HttpGet("code-injection")]
    public async Task<IActionResult> GetCodeInjections()
    {
        var result = await _mediator.Send(new GetCustomCodeInjectionsQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    // UX-11.3.1 Gallery Assist
    [HttpPut("gallery-assist")]
    public async Task<IActionResult> ConfigureGalleryAssist([FromBody] ConfigureGalleryAssistCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }
}
