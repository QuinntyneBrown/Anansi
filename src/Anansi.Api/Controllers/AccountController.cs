using Anansi.Application.Features.Account.Commands;
using Anansi.Application.Features.Account.Queries;
using Anansi.Application.Features.Storage.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var result = await _mediator.Send(new GetAccountSettingsQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateAccountSettingsCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount([FromQuery] bool exportFirst = false)
    {
        var result = await _mediator.Send(new DeleteAccountCommand(exportFirst));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(new { message = "Account has been deleted." });
    }

    [HttpGet("storage")]
    public async Task<IActionResult> GetStorageUsage()
    {
        var result = await _mediator.Send(new GetStorageUsageQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }
}
