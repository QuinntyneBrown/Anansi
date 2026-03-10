using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetProductsQuery(ProductType? ProductType, int Page = 1, int PageSize = 20) : IRequest<Result<PagedList<ProductDto>>>;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, Result<PagedList<ProductDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetProductsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<ProductDto>>> Handle(GetProductsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<ProductDto>>.Forbidden();

        var q = _db.Products
            .Include(p => p.Variations)
            .Where(p => p.PhotographerId == _currentUser.PhotographerId)
            .AsQueryable();

        if (query.ProductType.HasValue)
            q = q.Where(p => p.ProductType == query.ProductType);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var dtos = items.Select(p => new ProductDto(
            p.Id, p.Name, p.Description, p.ProductType, p.FulfillmentType,
            p.IsActive, p.LabPartner, p.LabColorCorrectionEnabled,
            p.PreviewImageUrl, p.DigitalResolutionOptions,
            p.Variations.Select(v => new ProductVariationDto(
                v.Id, v.Name, v.Sku, v.CostCents, v.MarkupCents,
                v.PriceCents, v.IsCustomPriced, v.IsActive)).ToList(),
            p.CreatedAt, p.UpdatedAt)).ToList();

        return Result<PagedList<ProductDto>>.Success(
            new PagedList<ProductDto>(dtos, total, query.Page, query.PageSize));
    }
}
