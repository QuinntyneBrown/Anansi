using Anansi.Application.Common;
using Anansi.Application.DTOs.Branding;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Branding.Watermarks;

/// <summary>
/// BRD-7.2.1 Text Watermarks, BRD-7.2.2 Image Watermarks, BRD-7.2.3 Per-Gallery Application.
/// </summary>
public record CreateWatermarkCommand(
    string Name,
    WatermarkType Type,
    string? Text,
    string? FontFamily,
    string? ImageUrl,
    double Opacity,
    double Scale,
    WatermarkPosition Position,
    bool IsDefault) : IRequest<Result<WatermarkDto>>;

public class CreateWatermarkValidator : AbstractValidator<CreateWatermarkCommand>
{
    public CreateWatermarkValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Opacity).InclusiveBetween(0.0, 1.0);
        RuleFor(x => x.Scale).GreaterThan(0);
        RuleFor(x => x.Text).NotEmpty().When(x => x.Type == WatermarkType.Text)
            .WithMessage("Text is required for text watermarks");
        RuleFor(x => x.ImageUrl).NotEmpty().When(x => x.Type == WatermarkType.Image)
            .WithMessage("Image URL is required for image watermarks");
    }
}

public class CreateWatermarkHandler : IRequestHandler<CreateWatermarkCommand, Result<WatermarkDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateWatermarkHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WatermarkDto>> Handle(CreateWatermarkCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WatermarkDto>.Failure("Not authenticated", 401);

        // If setting as default, clear other defaults
        if (request.IsDefault)
        {
            var existingDefaults = await _db.Set<Domain.Entities.Branding.Watermark>()
                .Where(w => w.PhotographerId == photographerId.Value && w.IsDefault)
                .ToListAsync(ct);
            foreach (var d in existingDefaults)
                d.IsDefault = false;
        }

        var watermark = new Domain.Entities.Branding.Watermark
        {
            PhotographerId = photographerId.Value,
            Name = request.Name,
            Type = request.Type,
            Text = request.Text,
            FontFamily = request.FontFamily,
            ImageUrl = request.ImageUrl,
            Opacity = request.Opacity,
            Scale = request.Scale,
            Position = request.Position,
            IsDefault = request.IsDefault
        };

        _db.Set<Domain.Entities.Branding.Watermark>().Add(watermark);
        await _db.SaveChangesAsync(ct);

        return Result<WatermarkDto>.Success(MapToDto(watermark));
    }

    private static WatermarkDto MapToDto(Domain.Entities.Branding.Watermark w) => new(
        w.Id, w.Name, w.Type, w.Text, w.FontFamily, w.ImageUrl,
        w.Opacity, w.Scale, w.Position, w.IsDefault, w.CreatedAt);
}

public record UpdateWatermarkCommand(
    Guid WatermarkId,
    string? Name,
    string? Text,
    string? FontFamily,
    string? ImageUrl,
    double? Opacity,
    double? Scale,
    WatermarkPosition? Position,
    bool? IsDefault) : IRequest<Result<WatermarkDto>>;

public class UpdateWatermarkHandler : IRequestHandler<UpdateWatermarkCommand, Result<WatermarkDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateWatermarkHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WatermarkDto>> Handle(UpdateWatermarkCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WatermarkDto>.Failure("Not authenticated", 401);

        var watermark = await _db.Set<Domain.Entities.Branding.Watermark>()
            .FirstOrDefaultAsync(w => w.Id == request.WatermarkId && w.PhotographerId == photographerId.Value, ct);
        if (watermark is null)
            return Result<WatermarkDto>.NotFound("Watermark not found");

        if (request.Name != null) watermark.Name = request.Name;
        if (request.Text != null) watermark.Text = request.Text;
        if (request.FontFamily != null) watermark.FontFamily = request.FontFamily;
        if (request.ImageUrl != null) watermark.ImageUrl = request.ImageUrl;
        if (request.Opacity.HasValue) watermark.Opacity = request.Opacity.Value;
        if (request.Scale.HasValue) watermark.Scale = request.Scale.Value;
        if (request.Position.HasValue) watermark.Position = request.Position.Value;

        if (request.IsDefault == true)
        {
            var existingDefaults = await _db.Set<Domain.Entities.Branding.Watermark>()
                .Where(w => w.PhotographerId == photographerId.Value && w.IsDefault && w.Id != watermark.Id)
                .ToListAsync(ct);
            foreach (var d in existingDefaults)
                d.IsDefault = false;
            watermark.IsDefault = true;
        }
        else if (request.IsDefault == false)
        {
            watermark.IsDefault = false;
        }

        await _db.SaveChangesAsync(ct);

        return Result<WatermarkDto>.Success(new WatermarkDto(
            watermark.Id, watermark.Name, watermark.Type, watermark.Text, watermark.FontFamily,
            watermark.ImageUrl, watermark.Opacity, watermark.Scale, watermark.Position,
            watermark.IsDefault, watermark.CreatedAt));
    }
}

public record ListWatermarksQuery : IRequest<Result<List<WatermarkDto>>>;

public class ListWatermarksHandler : IRequestHandler<ListWatermarksQuery, Result<List<WatermarkDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListWatermarksHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<WatermarkDto>>> Handle(ListWatermarksQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<WatermarkDto>>.Failure("Not authenticated", 401);

        var watermarks = await _db.Set<Domain.Entities.Branding.Watermark>()
            .Where(w => w.PhotographerId == photographerId.Value)
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Name)
            .Select(w => new WatermarkDto(w.Id, w.Name, w.Type, w.Text, w.FontFamily,
                w.ImageUrl, w.Opacity, w.Scale, w.Position, w.IsDefault, w.CreatedAt))
            .ToListAsync(ct);

        return Result<List<WatermarkDto>>.Success(watermarks);
    }
}

public record DeleteWatermarkCommand(Guid WatermarkId) : IRequest<Result>;

public class DeleteWatermarkHandler : IRequestHandler<DeleteWatermarkCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteWatermarkHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteWatermarkCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var watermark = await _db.Set<Domain.Entities.Branding.Watermark>()
            .FirstOrDefaultAsync(w => w.Id == request.WatermarkId && w.PhotographerId == photographerId.Value, ct);
        if (watermark is null)
            return Result.NotFound("Watermark not found");

        watermark.IsDeleted = true;
        watermark.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
