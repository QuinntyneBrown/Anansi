using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Presets;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Presets.Commands;

public record CreateEditingPresetCommand(CreateEditingPresetRequest Request) : IRequest<Result<EditingPresetDto>>;

public class CreateEditingPresetValidator : AbstractValidator<CreateEditingPresetCommand>
{
    public CreateEditingPresetValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.SkinToneRange).IsInEnum();
        RuleFor(x => x.Request.ShootingContext).IsInEnum();
    }
}

public class CreateEditingPresetHandler : IRequestHandler<CreateEditingPresetCommand, Result<EditingPresetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateEditingPresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EditingPresetDto>> Handle(CreateEditingPresetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<EditingPresetDto>.Forbidden();

        var req = cmd.Request;
        var preset = new EditingPreset
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = req.Name,
            Description = req.Description,
            SkinToneRange = req.SkinToneRange,
            ShootingContext = req.ShootingContext,
            IsPublic = req.IsPublic,
            IsSystemPreset = false,
            Temperature = req.Temperature,
            Tint = req.Tint,
            Exposure = req.Exposure,
            Contrast = req.Contrast,
            Highlights = req.Highlights,
            Shadows = req.Shadows,
            Whites = req.Whites,
            Blacks = req.Blacks,
            Clarity = req.Clarity,
            Vibrance = req.Vibrance,
            Saturation = req.Saturation,
            HslAdjustments = req.HslAdjustments ?? "[]",
            SplitToneHighlightHue = req.SplitToneHighlightHue,
            SplitToneHighlightSaturation = req.SplitToneHighlightSaturation,
            SplitToneShadowHue = req.SplitToneShadowHue,
            SplitToneShadowSaturation = req.SplitToneShadowSaturation
        };

        _db.EditingPresets.Add(preset);
        await _db.SaveChangesAsync(ct);

        return Result<EditingPresetDto>.Success(MapToDto(preset, false));
    }

    internal static EditingPresetDto MapToDto(EditingPreset p, bool isFavorited) => new(
        p.Id, p.PhotographerId, p.Name, p.Description,
        p.SkinToneRange, p.ShootingContext, p.IsPublic, p.IsSystemPreset, p.FavoriteCount, isFavorited,
        p.Temperature, p.Tint, p.Exposure, p.Contrast,
        p.Highlights, p.Shadows, p.Whites, p.Blacks,
        p.Clarity, p.Vibrance, p.Saturation,
        p.HslAdjustments,
        p.SplitToneHighlightHue, p.SplitToneHighlightSaturation,
        p.SplitToneShadowHue, p.SplitToneShadowSaturation,
        p.CreatedAt, p.UpdatedAt);

    internal static EditingPresetSummaryDto MapToSummaryDto(EditingPreset p, bool isFavorited) => new(
        p.Id, p.PhotographerId, p.Name, p.Description,
        p.SkinToneRange, p.ShootingContext, p.IsPublic, p.IsSystemPreset, p.FavoriteCount, isFavorited,
        p.CreatedAt);
}
