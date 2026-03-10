using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Presets.Commands;

public record UpdateEditingPresetCommand(Guid PresetId, UpdateEditingPresetRequest Request) : IRequest<Result<EditingPresetDto>>;

public class UpdateEditingPresetValidator : AbstractValidator<UpdateEditingPresetCommand>
{
    public UpdateEditingPresetValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.SkinToneRange).IsInEnum();
        RuleFor(x => x.Request.ShootingContext).IsInEnum();
    }
}

public class UpdateEditingPresetHandler : IRequestHandler<UpdateEditingPresetCommand, Result<EditingPresetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateEditingPresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EditingPresetDto>> Handle(UpdateEditingPresetCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<EditingPresetDto>.Forbidden();

        var preset = await _db.EditingPresets
            .FirstOrDefaultAsync(p => p.Id == cmd.PresetId, ct);

        if (preset is null)
            return Result<EditingPresetDto>.NotFound("Preset not found");

        if (preset.PhotographerId != _currentUser.PhotographerId)
            return Result<EditingPresetDto>.Forbidden("You can only update your own presets");

        var req = cmd.Request;
        preset.Name = req.Name;
        preset.Description = req.Description;
        preset.SkinToneRange = req.SkinToneRange;
        preset.ShootingContext = req.ShootingContext;
        preset.IsPublic = req.IsPublic;
        preset.Temperature = req.Temperature;
        preset.Tint = req.Tint;
        preset.Exposure = req.Exposure;
        preset.Contrast = req.Contrast;
        preset.Highlights = req.Highlights;
        preset.Shadows = req.Shadows;
        preset.Whites = req.Whites;
        preset.Blacks = req.Blacks;
        preset.Clarity = req.Clarity;
        preset.Vibrance = req.Vibrance;
        preset.Saturation = req.Saturation;
        preset.HslAdjustments = req.HslAdjustments ?? "[]";
        preset.SplitToneHighlightHue = req.SplitToneHighlightHue;
        preset.SplitToneHighlightSaturation = req.SplitToneHighlightSaturation;
        preset.SplitToneShadowHue = req.SplitToneShadowHue;
        preset.SplitToneShadowSaturation = req.SplitToneShadowSaturation;

        await _db.SaveChangesAsync(ct);

        var isFavorited = await _db.PresetFavorites
            .AnyAsync(f => f.PresetId == preset.Id && f.PhotographerId == _currentUser.PhotographerId, ct);

        return Result<EditingPresetDto>.Success(CreateEditingPresetHandler.MapToDto(preset, isFavorited));
    }
}
