using Anansi.Application.Features.Booking;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;
    public BookingsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("session-types")]
    public async Task<IActionResult> CreateSessionType(CreateSessionTypeCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/bookings/session-types/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpGet("session-types")]
    public async Task<IActionResult> ListSessionTypes(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListSessionTypesQuery(), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/bookings/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmBookingCommand command, CancellationToken ct)
    {
        if (id != command.BookingId)
        {
            command = command with { BookingId = id };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] BookingStatus? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListBookingsQuery(status, from, to, page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPost("coupons")]
    public async Task<IActionResult> CreateCoupon(CreateBookingCouponCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/bookings/coupons/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }
}
