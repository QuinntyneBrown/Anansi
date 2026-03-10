using Anansi.Application.Features.Integrations.Commands;
using Anansi.Application.Features.Integrations.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LabsController : ControllerBase
{
    private readonly IMediator _mediator;

    public LabsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("pricing/{labName}")]
    public async Task<IActionResult> GetPricing(string labName)
    {
        var result = await _mediator.Send(new GetLabPricingQuery(labName));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost("orders")]
    public async Task<IActionResult> SubmitOrder([FromBody] SubmitLabOrderCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(new { id = result.Value });
    }
}
