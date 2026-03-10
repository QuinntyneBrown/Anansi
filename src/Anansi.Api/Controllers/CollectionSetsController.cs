using Anansi.Application.Common;
using Anansi.Application.Features.Galleries.Sets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/collections/{collectionId:guid}/sets")]
[Authorize]
public class CollectionSetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CollectionSetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid collectionId) =>
        ToResult(await _mediator.Send(new ListSetsQuery(collectionId)));

    [HttpPost]
    public async Task<IActionResult> Create(Guid collectionId, [FromBody] CreateSetRequest request) =>
        ToResult(await _mediator.Send(new CreateSetCommand(collectionId, request.Title, request.Description, request.SortOrder, request.IsClientExclusive)));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid collectionId, Guid id, [FromBody] UpdateSetRequest request) =>
        ToResult(await _mediator.Send(new UpdateSetCommand(id, request.Title, request.Description, request.SortOrder, request.IsClientExclusive)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid collectionId, Guid id) =>
        ToResult(await _mediator.Send(new DeleteSetCommand(id)));

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder(Guid collectionId, [FromBody] ReorderSetsRequest request) =>
        ToResult(await _mediator.Send(new ReorderSetsCommand(collectionId, request.SetIdsInOrder)));

    private IActionResult ToResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, new { error = result.Error });

    private IActionResult ToResult(Result result) =>
        result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, new { error = result.Error });
}

public record CreateSetRequest(string Title, string? Description, int SortOrder, bool IsClientExclusive);
public record UpdateSetRequest(string Title, string? Description, int SortOrder, bool IsClientExclusive);
public record ReorderSetsRequest(List<Guid> SetIdsInOrder);
