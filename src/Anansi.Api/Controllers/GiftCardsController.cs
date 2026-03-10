using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Gift card management (STR-2.4.3).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GiftCardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GiftCardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetGiftCards()
    {
        var result = await _mediator.Send(new GetGiftCardsQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateGiftCard([FromBody] CreateGiftCardRequest request)
    {
        var result = await _mediator.Send(new CreateGiftCardCommand(request));
        return result.IsSuccess ? Created($"/api/giftcards/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
