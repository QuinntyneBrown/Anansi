using Anansi.Application.Features.CRM.Quotes;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuotesController : ControllerBase
{
    private readonly IMediator _mediator;
    public QuotesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] QuoteStatus? status,
        [FromQuery] string? search,
        [FromQuery] bool? isTemplate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new ListQuotesQuery(status, search, isTemplate, page, pageSize),
            ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateQuoteCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/quotes/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetQuoteQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new AcceptQuoteCommand(id), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
