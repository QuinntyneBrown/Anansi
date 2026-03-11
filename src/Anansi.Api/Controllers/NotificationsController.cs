using Anansi.Application.Features.Notifications.Commands;
using Anansi.Application.Features.Notifications.Queries;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] NotificationCategory? category,
        [FromQuery] bool? isRead,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetNotificationsQuery(category, isRead, page, pageSize));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await _mediator.Send(new GetUnreadCountQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(new { count = result.Value });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _mediator.Send(new MarkNotificationReadCommand(id));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _mediator.Send(new MarkAllNotificationsReadCommand());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var result = await _mediator.Send(new GetNotificationPreferencesQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreference([FromBody] UpdateNotificationPreferenceCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpPost("device-tokens")]
    public async Task<IActionResult> RegisterDeviceToken([FromBody] RegisterDeviceTokenCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpDelete("device-tokens")]
    public async Task<IActionResult> UnregisterDeviceToken([FromBody] UnregisterDeviceTokenCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }
}
