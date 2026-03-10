using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a product with optional variations (STR-2.1.1 through STR-2.1.6).
/// </summary>
public record CreateProductCommand(CreateProductRequest Request) : IRequest<Result<ProductDto>>;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.ProductType).IsInEnum();
        RuleFor(x => x.Request.FulfillmentType).IsInEnum();
        RuleForEach(x => x.Request.Variations).ChildRules(v =>
        {
            v.RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
            v.RuleFor(x => x.PriceCents).GreaterThanOrEqualTo(0);
        });
    }
}

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateProductHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<ProductDto>.Forbidden();

        var req = cmd.Request;
        var product = new Product
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = req.Name,
            Description = req.Description,
            ProductType = req.ProductType,
            FulfillmentType = req.FulfillmentType,
            LabPartner = req.LabPartner,
            LabColorCorrectionEnabled = req.LabColorCorrectionEnabled,
            PreviewImageUrl = req.PreviewImageUrl,
            DigitalResolutionOptions = req.DigitalResolutionOptions
        };

        if (req.Variations is { Count: > 0 })
        {
            foreach (var v in req.Variations)
            {
                product.Variations.Add(new ProductVariation
                {
                    Name = v.Name,
                    Sku = v.Sku,
                    CostCents = v.CostCents,
                    MarkupCents = v.MarkupCents,
                    PriceCents = v.PriceCents
                });
            }
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        return Result<ProductDto>.Success(MapToDto(product));
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id, p.Name, p.Description, p.ProductType, p.FulfillmentType,
        p.IsActive, p.LabPartner, p.LabColorCorrectionEnabled,
        p.PreviewImageUrl, p.DigitalResolutionOptions,
        p.Variations.Select(v => new ProductVariationDto(
            v.Id, v.Name, v.Sku, v.CostCents, v.MarkupCents,
            v.PriceCents, v.IsCustomPriced, v.IsActive)).ToList(),
        p.CreatedAt, p.UpdatedAt);
}
