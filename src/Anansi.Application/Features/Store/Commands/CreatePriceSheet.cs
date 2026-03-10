using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a price sheet with optional items (STR-2.3.3).
/// </summary>
public record CreatePriceSheetCommand(CreatePriceSheetRequest Request) : IRequest<Result<PriceSheetDto>>;

public class CreatePriceSheetValidator : AbstractValidator<CreatePriceSheetCommand>
{
    public CreatePriceSheetValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
    }
}

public class CreatePriceSheetHandler : IRequestHandler<CreatePriceSheetCommand, Result<PriceSheetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePriceSheetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PriceSheetDto>> Handle(CreatePriceSheetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PriceSheetDto>.Forbidden();

        var req = cmd.Request;

        // If setting as default, unset any existing default
        if (req.IsDefault)
        {
            var existingDefaults = await _db.PriceSheets
                .Where(ps => ps.PhotographerId == _currentUser.PhotographerId && ps.IsDefault)
                .ToListAsync(ct);
            foreach (var d in existingDefaults)
                d.IsDefault = false;
        }

        var sheet = new PriceSheet
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = req.Name,
            Description = req.Description,
            IsDownloadOnly = req.IsDownloadOnly,
            IsDefault = req.IsDefault
        };

        if (req.Items is { Count: > 0 })
        {
            foreach (var item in req.Items)
            {
                sheet.Items.Add(new PriceSheetItem
                {
                    ProductVariationId = item.ProductVariationId,
                    PriceCents = item.PriceCents
                });
            }
        }

        _db.PriceSheets.Add(sheet);
        await _db.SaveChangesAsync(ct);

        return Result<PriceSheetDto>.Success(new PriceSheetDto(
            sheet.Id, sheet.Name, sheet.Description, sheet.IsDownloadOnly, sheet.IsDefault,
            sheet.Items.Select(i => new PriceSheetItemDto(
                i.Id, i.ProductVariationId, string.Empty, i.PriceCents)).ToList(),
            sheet.CreatedAt, sheet.UpdatedAt));
    }
}
