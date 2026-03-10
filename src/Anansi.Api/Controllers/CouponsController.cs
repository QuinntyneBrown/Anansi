using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Coupon management (STR-2.4.1, STR-2.4.2).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCoupons()
    {
        var result = await _mediator.Send(new GetCouponsQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        var result = await _mediator.Send(new CreateCouponCommand(request));
        return result.IsSuccess ? Created($"/api/coupons/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
