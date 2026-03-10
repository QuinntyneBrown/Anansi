using Anansi.Application.Features.Discovery.Commands;
using Anansi.Application.Features.Discovery.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("cultural-tags")]
    public async Task<IActionResult> UpdateCulturalTags([FromBody] UpdateCulturalTagsCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpGet("cultural-tags")]
    public async Task<IActionResult> GetCulturalTags()
    {
        var result = await _mediator.Send(new GetCulturalTagsQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPut("service-area")]
    public async Task<IActionResult> UpdateServiceArea([FromBody] UpdateServiceAreaCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok();
    }

    [HttpGet("service-area")]
    public async Task<IActionResult> GetServiceArea()
    {
        var result = await _mediator.Send(new GetServiceAreaQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }
}
