using Anansi.Application.Features.Branding.Identity;
using Anansi.Application.Features.Branding.Watermarks;
using Anansi.Application.Features.Branding.Domains;
using Anansi.Application.Features.Branding.Documents;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// BRD-7.1.1 through BRD-7.4.2 - Branding & Customization.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BrandingController : ControllerBase
{
    private readonly IMediator _mediator;

    public BrandingController(IMediator mediator) => _mediator = mediator;

    // --- 7.1 Logo & Identity ---

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBrandingProfileQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateBrandingProfileCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    // --- 7.2 Watermarking ---

    [HttpGet("watermarks")]
    public async Task<IActionResult> ListWatermarks(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListWatermarksQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("watermarks")]
    public async Task<IActionResult> CreateWatermark([FromBody] CreateWatermarkCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("watermarks/{id:guid}")]
    public async Task<IActionResult> UpdateWatermark(Guid id, [FromBody] UpdateWatermarkCommand command, CancellationToken ct)
    {
        if (id != command.WatermarkId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("watermarks/{id:guid}")]
    public async Task<IActionResult> DeleteWatermark(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteWatermarkCommand(id), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    // --- 7.3 Custom Domains ---

    [HttpGet("domains")]
    public async Task<IActionResult> ListDomains(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListCustomDomainsQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("domains")]
    public async Task<IActionResult> CreateDomain([FromBody] CreateCustomDomainCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("domains/{id:guid}/verify")]
    public async Task<IActionResult> VerifyDomain(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new VerifyCustomDomainCommand(id), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("domains/{id:guid}")]
    public async Task<IActionResult> DeleteDomain(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteCustomDomainCommand(id), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    // --- 7.4 Document & Email Branding ---

    [HttpGet("documents")]
    public async Task<IActionResult> ListDocumentBrandings(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListDocumentBrandingsQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("documents/{documentType}")]
    public async Task<IActionResult> GetDocumentBranding(DocumentType documentType, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDocumentBrandingQuery(documentType), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("documents")]
    public async Task<IActionResult> UpsertDocumentBranding([FromBody] UpsertDocumentBrandingCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
