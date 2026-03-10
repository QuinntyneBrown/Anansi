using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetProductByIdQuery(Guid ProductId) : IRequest<Result<ProductDto>>;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetProductByIdHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(GetProductByIdQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<ProductDto>.Forbidden();

        var product = await _db.Products
            .Include(p => p.Variations)
            .FirstOrDefaultAsync(p => p.Id == query.ProductId && p.PhotographerId == _currentUser.PhotographerId, ct);

        if (product is null)
            return Result<ProductDto>.NotFound("Product not found");

        return Result<ProductDto>.Success(new ProductDto(
            product.Id, product.Name, product.Description, product.ProductType, product.FulfillmentType,
            product.IsActive, product.LabPartner, product.LabColorCorrectionEnabled,
            product.PreviewImageUrl, product.DigitalResolutionOptions,
            product.Variations.Select(v => new ProductVariationDto(
                v.Id, v.Name, v.Sku, v.CostCents, v.MarkupCents,
                v.PriceCents, v.IsCustomPriced, v.IsActive)).ToList(),
            product.CreatedAt, product.UpdatedAt));
    }
}
