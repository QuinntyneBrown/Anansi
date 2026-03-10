using Anansi.Application.Features.Events;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;
    public EventsController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// List events by date range. Public endpoint (EVT-24.2.1).
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] EventCategory? category,
        [FromQuery] string? neighborhood,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new ListEventsQuery(from, to, category, neighborhood), ct);
        return Ok(result.Value);
    }

    /// <summary>
    /// Create a community event (EVT-24.1.2).
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateEventCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Created($"/api/events/{result.Value!.Id}", result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Update an own community event (EVT-24.3.2).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventCommand command, CancellationToken ct)
    {
        if (id != command.EventId)
            command = command with { EventId = id };

        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Soft-delete an own community event (EVT-24.3.2).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteEventCommand(id), ct);
        return result.IsSuccess
            ? NoContent()
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Moderate community event status (EVT-24.3.1).
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateEventStatusCommand command, CancellationToken ct)
    {
        if (id != command.EventId)
            command = command with { EventId = id };

        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Sync an event to the photographer's booking calendar (EVT-24.2.2).
    /// </summary>
    [HttpPost("{id:guid}/sync")]
    [Authorize]
    public async Task<IActionResult> SyncToCalendar(Guid id, [FromBody] SyncEventToCalendarCommand command, CancellationToken ct)
    {
        if (id != command.EventId)
            command = command with { EventId = id };

        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Created($"/api/events/{id}/sync", result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// List synced calendar blocks for the current photographer (EVT-24.2.2).
    /// </summary>
    [HttpGet("calendar-blocks")]
    [Authorize]
    public async Task<IActionResult> ListCalendarBlocks(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new ListCalendarBlocksQuery(from, to), ct);
        return Ok(result.Value);
    }
}
