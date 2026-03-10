using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// Product catalog endpoints (STR-2.1.1 through STR-2.1.6, STR-2.3.1, STR-2.3.2).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductType? productType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetProductsQuery(productType, page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var result = await _mediator.Send(new CreateProductCommand(request));
        return result.IsSuccess ? CreatedAtAction(nameof(GetProduct), new { id = result.Value!.Id }, result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var result = await _mediator.Send(new UpdateProductCommand(id, request));
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    /// <summary>
    /// Apply bulk markup to all variations of a product type (STR-2.3.2).
    /// </summary>
    [HttpPost("bulk-markup")]
    public async Task<IActionResult> ApplyBulkMarkup([FromBody] BulkMarkupRequest request)
    {
        var result = await _mediator.Send(new ApplyBulkMarkupCommand(request));
        return result.IsSuccess ? Ok(new { updatedCount = result.Value }) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
