using Anansi.Application.Common;
using Anansi.Application.Features.Galleries.Media;
using Anansi.Application.Features.Galleries.Privacy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/collections/{collectionId:guid}/media")]
[Authorize]
public class GalleryMediaController : ControllerBase
{
    private readonly IMediator _mediator;

    public GalleryMediaController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid collectionId, [FromQuery] Guid? setId = null, [FromQuery] bool? starredOnly = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50) =>
        ToResult(await _mediator.Send(new ListMediaQuery(collectionId, setId, starredOnly, page, pageSize)));

    [HttpPost]
    public async Task<IActionResult> Upload(Guid collectionId, [FromForm] IFormFile file, [FromQuery] Guid? setId = null)
    {
        await using var stream = file.OpenReadStream();
        var command = new UploadMediaCommand(
            collectionId, setId, file.FileName, file.ContentType, file.Length, stream,
            null, null, null, null, null, null, null, null, null, null, null, null
        );
        return ToResult(await _mediator.Send(command));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid collectionId, Guid id) =>
        ToResult(await _mediator.Send(new DeleteMediaCommand(id)));

    [HttpPost("{id:guid}/move")]
    public async Task<IActionResult> Move(Guid collectionId, Guid id, [FromBody] MoveMediaRequest request) =>
        ToResult(await _mediator.Send(new MoveMediaCommand(id, request.TargetSetId)));

    [HttpPost("{id:guid}/star")]
    public async Task<IActionResult> ToggleStar(Guid collectionId, Guid id) =>
        ToResult(await _mediator.Send(new ToggleStarMediaCommand(id)));

    [HttpPost("bulk-star")]
    public async Task<IActionResult> BulkStar(Guid collectionId, [FromBody] BulkStarRequest request) =>
        ToResult(await _mediator.Send(new BulkStarMediaCommand(request.MediaIds, request.Star)));

    [HttpPost("{id:guid}/private")]
    [AllowAnonymous]
    public async Task<IActionResult> TogglePrivate(Guid collectionId, Guid id, [FromBody] TogglePrivateRequest request) =>
        ToResult(await _mediator.Send(new TogglePrivatePhotoCommand(id, request.ClientName, request.ClientEmail)));

    private IActionResult ToResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, new { error = result.Error });

    private IActionResult ToResult(Result result) =>
        result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, new { error = result.Error });
}

public record MoveMediaRequest(Guid? TargetSetId);
public record BulkStarRequest(List<Guid> MediaIds, bool Star);
public record TogglePrivateRequest(string? ClientName, string? ClientEmail);
