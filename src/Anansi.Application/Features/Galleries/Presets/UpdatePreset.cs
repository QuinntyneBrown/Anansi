using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Presets;

public record UpdatePresetCommand(
    Guid Id,
    string Name,
    CoverStyle CoverStyle,
    ThemeMode Theme,
    string FontFamily,
    string ColorPalette,
    string? CustomColorHex,
    GridLayout Layout,
    bool DownloadsEnabled,
    bool DownloadPinEnabled,
    string AllowedResolutions,
    bool RequireEmailRegistration,
    GalleryLanguage Language
) : IRequest<Result<CollectionPresetDto>>;

public class UpdatePresetValidator : AbstractValidator<UpdatePresetCommand>
{
    public UpdatePresetValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
    }
}

public class UpdatePresetHandler : IRequestHandler<UpdatePresetCommand, Result<CollectionPresetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdatePresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionPresetDto>> Handle(UpdatePresetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionPresetDto>.Forbidden("Not authenticated");

        var preset = await _db.CollectionPresets
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (preset is null)
            return Result<CollectionPresetDto>.NotFound("Preset not found");

        preset.Name = request.Name;
        preset.CoverStyle = request.CoverStyle;
        preset.Theme = request.Theme;
        preset.FontFamily = request.FontFamily;
        preset.ColorPalette = request.ColorPalette;
        preset.CustomColorHex = request.CustomColorHex;
        preset.Layout = request.Layout;
        preset.DownloadsEnabled = request.DownloadsEnabled;
        preset.DownloadPinEnabled = request.DownloadPinEnabled;
        preset.AllowedResolutions = request.AllowedResolutions;
        preset.RequireEmailRegistration = request.RequireEmailRegistration;
        preset.Language = request.Language;

        await _db.SaveChangesAsync(ct);

        return Result<CollectionPresetDto>.Success(CreatePresetHandler.MapToDto(preset));
    }
}
