using Anansi.Application.DTOs.Presets;
using Anansi.Application.Features.Presets.Commands;
using Anansi.Application.Features.Presets.Queries;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Skin tone preset library endpoints (PRE-23.1.1 through PRE-23.3.3).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PresetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PresetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Browse presets by category (PRE-23.2.1).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPresets(
        [FromQuery] SkinToneRange? skinTone,
        [FromQuery] ShootingContext? context,
        [FromQuery] bool? isSystem,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetEditingPresetsQuery(skinTone, context, isSystem, page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Get preset detail (PRE-23.2.3).
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPreset(Guid id)
    {
        var result = await _mediator.Send(new GetEditingPresetByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Create editing preset (PRE-23.1.1).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePreset([FromBody] CreateEditingPresetRequest request)
    {
        var result = await _mediator.Send(new CreateEditingPresetCommand(request));
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetPreset), new { id = result.Value!.Id }, result.Value)
            : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Update own preset (PRE-23.3.1).
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePreset(Guid id, [FromBody] UpdateEditingPresetRequest request)
    {
        var result = await _mediator.Send(new UpdateEditingPresetCommand(id, request));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Delete own preset (PRE-23.3.2).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePreset(Guid id)
    {
        var result = await _mediator.Send(new DeleteEditingPresetCommand(id));
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Favorite a preset (PRE-23.2.2).
    /// </summary>
    [HttpPost("{id:guid}/favorite")]
    public async Task<IActionResult> FavoritePreset(Guid id)
    {
        var result = await _mediator.Send(new FavoritePresetCommand(id));
        return result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Unfavorite a preset (PRE-23.2.2).
    /// </summary>
    [HttpDelete("{id:guid}/favorite")]
    public async Task<IActionResult> UnfavoritePreset(Guid id)
    {
        var result = await _mediator.Send(new UnfavoritePresetCommand(id));
        return result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Get user's favorited presets (PRE-23.2.2).
    /// </summary>
    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetFavoritePresetsQuery(page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
