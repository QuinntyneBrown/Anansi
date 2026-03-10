using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Shipping method management (STR-2.5.3).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShippingMethodsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShippingMethodsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetShippingMethods()
    {
        var result = await _mediator.Send(new GetShippingMethodsQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateShippingMethod([FromBody] CreateShippingMethodRequest request)
    {
        var result = await _mediator.Send(new CreateShippingMethodCommand(request));
        return result.IsSuccess ? Created($"/api/shippingmethods/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
