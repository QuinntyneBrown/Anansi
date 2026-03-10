using Anansi.Application.Features.Tax;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/tax-profile")]
[Authorize]
public class TaxProfileController : ControllerBase
{
    private readonly IMediator _mediator;
    public TaxProfileController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTaxProfileQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateTaxProfileCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("threshold")]
    public async Task<IActionResult> GetThreshold(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetThresholdStatusQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("expenses")]
    public async Task<IActionResult> RecordExpense(RecordBusinessExpenseCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Created($"/api/tax-profile/expenses/{result.Value!.Id}", result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("itc-summary")]
    public async Task<IActionResult> GetItcSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetItcSummaryQuery(from, to), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
