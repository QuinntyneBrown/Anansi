using Anansi.Application.Features.Finance;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Record(RecordPaymentCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/payments/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRevenueDashboardQuery(from, to), ct);
        return Ok(result.Value);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> Transactions([FromQuery] PaymentMethod? method, [FromQuery] string? search, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListTransactionsQuery(method, search, from, to, page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var result = await _mediator.Send(new ExportTransactionsQuery(from, to), ct);
        return result.IsSuccess ? File(System.Text.Encoding.UTF8.GetBytes(result.Value!), "text/csv", "transactions.csv") : BadRequest(result.Error);
    }

    [HttpPost("gift-cards")]
    public async Task<IActionResult> CreateGiftCard(CreateGiftCardCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/payments/gift-cards/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpPost("gift-cards/redeem")]
    public async Task<IActionResult> RedeemGiftCard(RedeemGiftCardCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("financing/apply")]
    public async Task<IActionResult> ApplyForFinancing(ApplyForFinancingCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/payments/financing/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("financing/{id:guid}")]
    public async Task<IActionResult> GetFinancing(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFinancingApplicationQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }
}
