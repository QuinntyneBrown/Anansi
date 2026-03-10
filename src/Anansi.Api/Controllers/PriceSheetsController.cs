using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Price sheet management (STR-2.3.3).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PriceSheetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PriceSheetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetPriceSheets()
    {
        var result = await _mediator.Send(new GetPriceSheetsQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePriceSheet([FromBody] CreatePriceSheetRequest request)
    {
        var result = await _mediator.Send(new CreatePriceSheetCommand(request));
        return result.IsSuccess ? Created($"/api/pricesheets/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
