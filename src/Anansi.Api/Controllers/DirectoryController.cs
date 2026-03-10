using Anansi.Application.Features.Discovery.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DirectoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public DirectoryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("cultural-tags")]
    public async Task<IActionResult> ListAvailableCulturalTags()
    {
        var result = await _mediator.Send(new ListAvailableCulturalTagsQuery());
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? tags,
        [FromQuery] string? neighborhood,
        [FromQuery] int page = 1)
    {
        var tagList = string.IsNullOrWhiteSpace(tags)
            ? null
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var result = await _mediator.Send(new SearchPhotographersQuery(tagList, neighborhood, page));
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode ?? 400, new { error = result.Error });
        return Ok(result.Value);
    }
}
