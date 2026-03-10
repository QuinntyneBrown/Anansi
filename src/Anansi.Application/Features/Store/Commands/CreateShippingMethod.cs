using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a shipping method (STR-2.5.3).
/// </summary>
public record CreateShippingMethodCommand(CreateShippingMethodRequest Request) : IRequest<Result<ShippingMethodDto>>;

public class CreateShippingMethodValidator : AbstractValidator<CreateShippingMethodCommand>
{
    public CreateShippingMethodValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.CostCents).GreaterThanOrEqualTo(0);
    }
}

public class CreateShippingMethodHandler : IRequestHandler<CreateShippingMethodCommand, Result<ShippingMethodDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateShippingMethodHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<ShippingMethodDto>> Handle(CreateShippingMethodCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<ShippingMethodDto>.Forbidden();

        var req = cmd.Request;
        var method = new ShippingMethod
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = req.Name,
            Description = req.Description,
            CostCents = req.CostCents,
            EstimatedDelivery = req.EstimatedDelivery
        };

        _db.ShippingMethods.Add(method);
        await _db.SaveChangesAsync(ct);

        return Result<ShippingMethodDto>.Success(new ShippingMethodDto(
            method.Id, method.Name, method.Description,
            method.CostCents, method.EstimatedDelivery, method.IsActive));
    }
}
