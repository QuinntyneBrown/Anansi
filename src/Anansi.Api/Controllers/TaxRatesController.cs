using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Tax rate management (STR-2.5.2).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaxRatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TaxRatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetTaxRates()
    {
        var result = await _mediator.Send(new GetTaxRatesQuery());
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTaxRate([FromBody] CreateTaxRateRequest request)
    {
        var result = await _mediator.Send(new CreateTaxRateCommand(request));
        return result.IsSuccess ? Created($"/api/taxrates/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
