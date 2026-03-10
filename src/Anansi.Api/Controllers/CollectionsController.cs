using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Features.Galleries.Activities;
using Anansi.Application.Features.Galleries.Collections;
using Anansi.Application.Features.Galleries.Downloads;
using Anansi.Application.Features.Galleries.Privacy;
using Anansi.Application.Features.Galleries.Sharing;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CollectionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CollectionsController(IMediator mediator) => _mediator = mediator;

    // === Collection CRUD (GAL-1.2.1) ===

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCollectionCommand command) =>
        ToResult(await _mediator.Send(command));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] bool? starredOnly = null, [FromQuery] CollectionStatus? status = null,
        [FromQuery] string? search = null) =>
        ToResult(await _mediator.Send(new ListCollectionsQuery(page, pageSize, starredOnly, status, search)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id) =>
        ToResult(await _mediator.Send(new GetCollectionQuery(id)));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCollectionCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        return ToResult(await _mediator.Send(command));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) =>
        ToResult(await _mediator.Send(new DeleteCollectionCommand(id)));

    // === Bulk Create (GAL-1.2.2) ===

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkCreate([FromBody] BulkCreateCollectionsCommand command) =>
        ToResult(await _mediator.Send(command));

    // === Star/Bookmark (GAL-1.2.3) ===

    [HttpPost("{id:guid}/star")]
    public async Task<IActionResult> ToggleStar(Guid id) =>
        ToResult(await _mediator.Send(new ToggleStarCollectionCommand(id)));

    // === Privacy (GAL-1.6.1, GAL-1.6.2) ===

    [HttpPut("{id:guid}/password")]
    public async Task<IActionResult> SetPassword(Guid id, [FromBody] SetPasswordRequest request) =>
        ToResult(await _mediator.Send(new SetCollectionPasswordCommand(id, request.Password, request.ClientExclusivePassword)));

    [HttpPost("{id:guid}/verify-password")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyPassword(Guid id, [FromBody] VerifyPasswordRequest request) =>
        ToResult(await _mediator.Send(new VerifyCollectionPasswordQuery(id, request.Password)));

    // === Email Registration (GAL-1.6.4) ===

    [HttpPost("{id:guid}/register-email")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterEmail(Guid id, [FromBody] RegisterEmailRequest request) =>
        ToResult(await _mediator.Send(new RegisterEmailCommand(id, request.Name, request.Email)));

    [HttpGet("{id:guid}/email-registrations")]
    public async Task<IActionResult> ListEmailRegistrations(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50) =>
        ToResult(await _mediator.Send(new ListEmailRegistrationsQuery(id, page, pageSize)));

    // === Expiry (GAL-1.6.6, GAL-1.6.7) ===

    [HttpPut("{id:guid}/expiry")]
    public async Task<IActionResult> SetExpiry(Guid id, [FromBody] SetExpiryRequest request) =>
        ToResult(await _mediator.Send(new SetCollectionExpiryCommand(id, request.ExpiresAt, request.ReminderRecipients, request.ReminderDays, request.ReminderEmailTemplate)));

    // === Downloads (GAL-1.4.1 through GAL-1.4.5) ===

    [HttpPost("{id:guid}/download")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestDownload(Guid id, [FromBody] RequestDownloadRequest request) =>
        ToResult(await _mediator.Send(new RequestDownloadCommand(id, request.Resolution, request.IsFullGallery, request.MediaIds, request.Pin, request.RequestedBy, request.RequestedByEmail)));

    [HttpGet("{id:guid}/download/{downloadId:guid}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDownloadStatus(Guid id, Guid downloadId) =>
        ToResult(await _mediator.Send(new GetDownloadStatusQuery(downloadId)));

    [HttpGet("{id:guid}/download-activity")]
    public async Task<IActionResult> ListDownloadActivity(Guid id, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50) =>
        ToResult(await _mediator.Send(new ListDownloadActivityQuery(id, from, to, page, pageSize)));

    [HttpPut("{id:guid}/download-limit")]
    public async Task<IActionResult> ResetDownloadLimit(Guid id, [FromBody] ResetDownloadLimitRequest request) =>
        ToResult(await _mediator.Send(new ResetDownloadLimitCommand(id, request.NewLimit)));

    // === Sharing (GAL-1.7.1, GAL-1.7.3, GAL-1.7.4, GAL-1.7.5) ===

    [HttpPost("{id:guid}/invite")]
    public async Task<IActionResult> SendInvitation(Guid id, [FromBody] SendEmailInvitationCommand command)
    {
        if (id != command.CollectionId) return BadRequest("ID mismatch");
        return ToResult(await _mediator.Send(command));
    }

    [HttpPost("{id:guid}/quick-share")]
    public async Task<IActionResult> CreateQuickShare(Guid id, [FromBody] CreateQuickShareRequest request) =>
        ToResult(await _mediator.Send(new CreateQuickShareLinkCommand(id, request.MediaIds)));

    [HttpDelete("quick-share/{linkId:guid}")]
    public async Task<IActionResult> RevokeQuickShare(Guid linkId) =>
        ToResult(await _mediator.Send(new RevokeQuickShareLinkCommand(linkId)));

    [HttpGet("{id:guid}/qr-code")]
    public async Task<IActionResult> GenerateQrCode(Guid id) =>
        ToResult(await _mediator.Send(new GenerateQrCodeQuery(id)));

    [HttpGet("{id:guid}/embed")]
    public async Task<IActionResult> GetEmbedCode(Guid id) =>
        ToResult(await _mediator.Send(new GetEmbedCodeQuery(id)));

    // === Activities (GAL-1.9.1, GAL-1.9.2) ===

    [HttpGet("{id:guid}/activities")]
    public async Task<IActionResult> ListActivities(Guid id, [FromQuery] ActivityType? type = null, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50) =>
        ToResult(await _mediator.Send(new ListActivitiesQuery(id, type, from, to, page, pageSize)));

    [HttpGet("{id:guid}/activities/export")]
    public async Task<IActionResult> ExportActivities(Guid id, [FromQuery] ActivityType? type = null, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var result = await _mediator.Send(new ExportActivityCsvQuery(id, type, from, to));
        if (!result.IsSuccess) return StatusCode(result.StatusCode ?? 400, result.Error);
        return File(result.Value!, "text/csv", "activity-export.csv");
    }

    [HttpPut("{id:guid}/analytics")]
    public async Task<IActionResult> SetGoogleAnalytics(Guid id, [FromBody] SetGoogleAnalyticsRequest request) =>
        ToResult(await _mediator.Send(new SetGoogleAnalyticsCommand(id, request.GoogleAnalyticsPropertyId)));

    // === Helper ===

    private IActionResult ToResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, new { error = result.Error });

    private IActionResult ToResult(Result result) =>
        result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, new { error = result.Error });
}

// Request models
public record SetPasswordRequest(string? Password, string? ClientExclusivePassword);
public record VerifyPasswordRequest(string Password);
public record RegisterEmailRequest(string Name, string Email);
public record SetExpiryRequest(DateTime? ExpiresAt, string? ReminderRecipients, string? ReminderDays, string? ReminderEmailTemplate);
public record RequestDownloadRequest(DownloadResolution Resolution, bool IsFullGallery, List<Guid>? MediaIds, string? Pin, string? RequestedBy, string? RequestedByEmail);
public record ResetDownloadLimitRequest(int? NewLimit);
public record CreateQuickShareRequest(List<Guid> MediaIds);
public record SetGoogleAnalyticsRequest(string? GoogleAnalyticsPropertyId);
