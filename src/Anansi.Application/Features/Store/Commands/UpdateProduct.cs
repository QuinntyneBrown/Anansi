using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Commands;

public record UpdateProductCommand(Guid ProductId, UpdateProductRequest Request) : IRequest<Result<ProductDto>>;

public class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
    }
}

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateProductHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<ProductDto>.Forbidden();

        var product = await _db.Products
            .Include(p => p.Variations)
            .FirstOrDefaultAsync(p => p.Id == cmd.ProductId && p.PhotographerId == _currentUser.PhotographerId, ct);

        if (product is null)
            return Result<ProductDto>.NotFound("Product not found");

        var req = cmd.Request;
        product.Name = req.Name;
        product.Description = req.Description;
        product.IsActive = req.IsActive;
        product.LabPartner = req.LabPartner;
        product.LabColorCorrectionEnabled = req.LabColorCorrectionEnabled;
        product.PreviewImageUrl = req.PreviewImageUrl;
        product.DigitalResolutionOptions = req.DigitalResolutionOptions;

        await _db.SaveChangesAsync(ct);

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
