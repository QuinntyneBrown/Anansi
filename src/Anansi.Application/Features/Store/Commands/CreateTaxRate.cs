using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a tax rate (STR-2.5.2).
/// </summary>
public record CreateTaxRateCommand(CreateTaxRateRequest Request) : IRequest<Result<TaxRateDto>>;

public class CreateTaxRateValidator : AbstractValidator<CreateTaxRateCommand>
{
    public CreateTaxRateValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Region).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.Percentage).InclusiveBetween(0, 100);
    }
}

public class CreateTaxRateHandler : IRequestHandler<CreateTaxRateCommand, Result<TaxRateDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTaxRateHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxRateDto>> Handle(CreateTaxRateCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<TaxRateDto>.Forbidden();

        var req = cmd.Request;
        var taxRate = new TaxRate
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = req.Name,
            Region = req.Region,
            Percentage = req.Percentage
        };

        _db.TaxRates.Add(taxRate);
        await _db.SaveChangesAsync(ct);

        return Result<TaxRateDto>.Success(new TaxRateDto(
            taxRate.Id, taxRate.Name, taxRate.Region, taxRate.Percentage, taxRate.IsActive));
    }
}
