using Anansi.Application.Features.CRM.Invoices;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;
    public InvoicesController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create(CreateInvoiceCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/invoices/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetInvoiceQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] InvoiceStatus? status, [FromQuery] bool? isTemplate, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListInvoicesQuery(status, isTemplate, page, pageSize), ct);
        return Ok(result.Value);
    }
}
