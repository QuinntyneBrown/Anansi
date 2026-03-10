using Anansi.Application.DTOs.Plans;
using Anansi.Application.Features.Plans.Commands;
using Anansi.Application.Features.Plans.Queries;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Plan and subscription management (PLN-10.1.1 through PLN-10.2.4).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lists available plans (PLN-10.1.1, PLN-10.1.2, PLN-10.1.3).
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlans([FromQuery] PlanProduct? product)
    {
        var result = await _mediator.Send(new GetPlansQuery(product));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreatePlan([FromBody] CreatePlanRequest request)
    {
        var result = await _mediator.Send(new CreatePlanCommand(request));
        return result.IsSuccess ? Created($"/api/plans/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] UpdatePlanRequest request)
    {
        var result = await _mediator.Send(new UpdatePlanCommand(id, request));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Gets the current subscription (PLN-10.1.2).
    /// </summary>
    [HttpGet("subscription")]
    [Authorize]
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var result = await _mediator.Send(new GetCurrentSubscriptionQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Subscribe to a plan (PLN-10.1.1, PLN-10.1.2).
    /// </summary>
    [HttpPost("subscription")]
    [Authorize]
    public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionRequest request)
    {
        var result = await _mediator.Send(new CreateSubscriptionCommand(request));
        return result.IsSuccess ? Created("/api/plans/subscription", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Change plan (upgrade/downgrade with proration) (PLN-10.1.2).
    /// </summary>
    [HttpPut("subscription")]
    [Authorize]
    public async Task<IActionResult> ChangeSubscription([FromBody] ChangeSubscriptionRequest request)
    {
        var result = await _mediator.Send(new ChangeSubscriptionCommand(request));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Cancel subscription.
    /// </summary>
    [HttpDelete("subscription")]
    [Authorize]
    public async Task<IActionResult> CancelSubscription([FromQuery] bool immediate = false)
    {
        var result = await _mediator.Send(new CancelSubscriptionCommand(immediate));
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Check feature access under current plan (PLN-10.2.1 through PLN-10.2.4).
    /// </summary>
    [HttpGet("features/{featureKey}")]
    [Authorize]
    public async Task<IActionResult> CheckFeatureAccess(string featureKey)
    {
        var result = await _mediator.Send(new CheckFeatureAccessQuery(featureKey));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
