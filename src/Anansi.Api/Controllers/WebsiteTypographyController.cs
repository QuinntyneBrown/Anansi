using Anansi.Application.Features.Website.Typography;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.4.1 Font System (1000+ fonts, custom upload),
/// WEB-3.4.2 Color System (40+ palettes, custom hex).
/// </summary>
[ApiController]
[Route("api/website-typography")]
[Authorize]
public class WebsiteTypographyController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsiteTypographyController(IMediator mediator) => _mediator = mediator;

    [HttpGet("fonts")]
    public async Task<IActionResult> ListFonts(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListCustomFontsQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("fonts")]
    public async Task<IActionResult> UploadFont([FromBody] UploadCustomFontCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("fonts/{fontId:guid}")]
    public async Task<IActionResult> DeleteFont(Guid fontId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteCustomFontCommand(fontId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("color-palettes")]
    public async Task<IActionResult> ListColorPalettes(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListColorPalettesQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("color-palettes")]
    public async Task<IActionResult> CreateColorPalette([FromBody] CreateCustomColorPaletteCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
