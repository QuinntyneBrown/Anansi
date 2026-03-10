using Anansi.Application.Features.Interac;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/interac")]
[Authorize]
public class InteracController : ControllerBase
{
    private readonly IMediator _mediator;
    public InteracController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// INT-20.1.1: Create an Interac e-Transfer payment request from an invoice.
    /// </summary>
    [HttpPost("payment-requests")]
    public async Task<IActionResult> CreatePaymentRequest([FromBody] CreateInteracPaymentRequestCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Created($"/api/interac/payment-requests/{result.Value!.Id}", result.Value);
    }

    /// <summary>
    /// INT-20.1.2: Confirm receipt of an Interac e-Transfer payment.
    /// </summary>
    [HttpPost("payment-requests/{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmPayment(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ConfirmInteracPaymentCommand(id), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    /// <summary>
    /// INT-20.1.3: List Interac e-Transfer payment requests with optional status filter.
    /// </summary>
    [HttpGet("payment-requests")]
    public async Task<IActionResult> ListPaymentRequests(
        [FromQuery] InteracPaymentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetInteracPaymentRequestsQuery(status, page, pageSize), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    /// <summary>
    /// INT-20.2.1: Configure Interac e-Transfer email.
    /// </summary>
    [HttpPut("~/api/settings/interac")]
    public async Task<IActionResult> ConfigureInterac([FromBody] ConfigureInteracCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    /// <summary>
    /// INT-20.2.1: Get Interac e-Transfer configuration.
    /// </summary>
    [HttpGet("~/api/settings/interac")]
    public async Task<IActionResult> GetInteracConfig(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetInteracConfigQuery(), ct);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }
}
