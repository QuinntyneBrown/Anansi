using Anansi.Application.Common;
using Anansi.Application.Features.Galleries.Favorites;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FavoritesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> ListAll([FromQuery] Guid? collectionId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50) =>
        ToResult(await _mediator.Send(new ListFavoriteListsQuery(collectionId, page, pageSize)));

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateList([FromBody] CreateFavoriteListCommand command) =>
        ToResult(await _mediator.Send(command));

    [HttpGet("{id:guid}/items")]
    [AllowAnonymous]
    public async Task<IActionResult> GetItems(Guid id) =>
        ToResult(await _mediator.Send(new GetFavoriteListItemsQuery(id)));

    [HttpPost("{id:guid}/items")]
    [AllowAnonymous]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] AddFavoriteItemRequest request) =>
        ToResult(await _mediator.Send(new AddFavoriteItemCommand(id, request.MediaId, request.Comment)));

    [HttpDelete("items/{itemId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> RemoveItem(Guid itemId) =>
        ToResult(await _mediator.Send(new RemoveFavoriteItemCommand(itemId)));

    [HttpPut("items/{itemId:guid}/comment")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateComment(Guid itemId, [FromBody] UpdateCommentRequest request) =>
        ToResult(await _mediator.Send(new UpdateFavoriteCommentCommand(itemId, request.Comment)));

    [HttpPost("{id:guid}/complete")]
    [AllowAnonymous]
    public async Task<IActionResult> Complete(Guid id) =>
        ToResult(await _mediator.Send(new CompleteFavoriteListCommand(id)));

    private IActionResult ToResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, new { error = result.Error });

    private IActionResult ToResult(Result result) =>
        result.IsSuccess ? Ok() : StatusCode(result.StatusCode ?? 400, new { error = result.Error });
}

public record AddFavoriteItemRequest(Guid MediaId, string? Comment);
public record UpdateCommentRequest(string Comment);
