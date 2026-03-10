using Anansi.Application.Features.CRM.Contracts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ContractsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create(CreateContractCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/contracts/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetContractQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool? isTemplate, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListContractsQuery(isTemplate, page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new SendContractCommand(id), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("{contractId:guid}/sign/{signatureId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Sign(Guid contractId, Guid signatureId, SignContractCommand command, CancellationToken ct)
    {
        if (contractId != command.ContractId || signatureId != command.SignatureId)
        {
            command = command with { ContractId = contractId, SignatureId = signatureId };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
