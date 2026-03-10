using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record SubmitLabOrderCommand(
    Guid StoreOrderId,
    string LabName,
    string ImageFileKey,
    string ProductSpecifications,
    string Size,
    int Quantity,
    string ShippingName,
    string ShippingAddress,
    string ShippingCity,
    string ShippingProvince,
    string ShippingPostalCode,
    string ShippingCountry) : IRequest<Result<Guid>>;

public class SubmitLabOrderCommandValidator : AbstractValidator<SubmitLabOrderCommand>
{
    public SubmitLabOrderCommandValidator()
    {
        RuleFor(x => x.LabName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ImageFileKey).NotEmpty();
        RuleFor(x => x.ProductSpecifications).NotEmpty();
        RuleFor(x => x.Size).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.ShippingName).NotEmpty();
        RuleFor(x => x.ShippingAddress).NotEmpty();
        RuleFor(x => x.ShippingCity).NotEmpty();
        RuleFor(x => x.ShippingProvince).NotEmpty();
        RuleFor(x => x.ShippingPostalCode).NotEmpty();
        RuleFor(x => x.ShippingCountry).NotEmpty();
    }
}
