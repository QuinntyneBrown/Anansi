using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Galleries.Presets;

// GAL-1.2.4: Collection Presets
public record CreatePresetCommand(
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

public class CreatePresetValidator : AbstractValidator<CreatePresetCommand>
{
    public CreatePresetValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.FontFamily).MaximumLength(100);
        RuleFor(x => x.ColorPalette).MaximumLength(100);
    }
}

public class CreatePresetHandler : IRequestHandler<CreatePresetCommand, Result<CollectionPresetDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePresetHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionPresetDto>> Handle(CreatePresetCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionPresetDto>.Forbidden("Not authenticated");

        var preset = new CollectionPreset
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Name = request.Name,
            CoverStyle = request.CoverStyle,
            Theme = request.Theme,
            FontFamily = request.FontFamily,
            ColorPalette = request.ColorPalette,
            CustomColorHex = request.CustomColorHex,
            Layout = request.Layout,
            DownloadsEnabled = request.DownloadsEnabled,
            DownloadPinEnabled = request.DownloadPinEnabled,
            AllowedResolutions = request.AllowedResolutions,
            RequireEmailRegistration = request.RequireEmailRegistration,
            Language = request.Language
        };

        _db.CollectionPresets.Add(preset);
        await _db.SaveChangesAsync(ct);

        return Result<CollectionPresetDto>.Success(MapToDto(preset));
    }

    internal static CollectionPresetDto MapToDto(CollectionPreset p) => new(
        p.Id, p.Name, p.CoverStyle, p.Theme, p.FontFamily, p.ColorPalette, p.CustomColorHex,
        p.Layout, p.DownloadsEnabled, p.DownloadPinEnabled, p.AllowedResolutions,
        p.RequireEmailRegistration, p.Language, p.CreatedAt, p.UpdatedAt
    );
}
