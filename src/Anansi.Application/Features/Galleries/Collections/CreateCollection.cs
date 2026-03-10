using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

// GAL-1.2.1: Create Collection
public record CreateCollectionCommand(
    string Title,
    string? Description,
    CoverStyle CoverStyle,
    ThemeMode Theme,
    string FontFamily,
    string ColorPalette,
    string? CustomColorHex,
    GridLayout Layout,
    GalleryLanguage Language,
    Guid? PresetId
) : IRequest<Result<CollectionDto>>;

public class CreateCollectionValidator : AbstractValidator<CreateCollectionCommand>
{
    public CreateCollectionValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(5000);
        RuleFor(x => x.FontFamily).MaximumLength(100);
        RuleFor(x => x.ColorPalette).MaximumLength(100);
        RuleFor(x => x.CustomColorHex).MaximumLength(10);
    }
}

public class CreateCollectionHandler : IRequestHandler<CreateCollectionCommand, Result<CollectionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCollectionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionDto>> Handle(CreateCollectionCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionDto>.Forbidden("Not authenticated");

        var photographerId = _currentUser.PhotographerId.Value;

        var collection = new Collection
        {
            PhotographerId = photographerId,
            Title = request.Title,
            Description = request.Description,
            Slug = GenerateSlug(request.Title),
            CoverStyle = request.CoverStyle,
            Theme = request.Theme,
            FontFamily = request.FontFamily,
            ColorPalette = request.ColorPalette,
            CustomColorHex = request.CustomColorHex,
            Layout = request.Layout,
            Language = request.Language,
            PresetId = request.PresetId,
            DownloadPin = GeneratePin(),
            Status = CollectionStatus.Draft
        };

        // Apply preset if specified
        if (request.PresetId.HasValue)
        {
            var preset = await _db.CollectionPresets
                .FirstOrDefaultAsync(p => p.Id == request.PresetId.Value && p.PhotographerId == photographerId, ct);

            if (preset != null)
            {
                collection.CoverStyle = preset.CoverStyle;
                collection.Theme = preset.Theme;
                collection.FontFamily = preset.FontFamily;
                collection.ColorPalette = preset.ColorPalette;
                collection.CustomColorHex = preset.CustomColorHex;
                collection.Layout = preset.Layout;
                collection.DownloadsEnabled = preset.DownloadsEnabled;
                collection.DownloadPinEnabled = preset.DownloadPinEnabled;
                collection.AllowedResolutions = preset.AllowedResolutions;
                collection.RequireEmailRegistration = preset.RequireEmailRegistration;
                collection.Language = preset.Language;
            }
        }

        _db.Collections.Add(collection);
        await _db.SaveChangesAsync(ct);

        return Result<CollectionDto>.Success(MapToDto(collection, 0, 0));
    }

    private static string GenerateSlug(string title) =>
        title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "") + "-" + Guid.NewGuid().ToString("N")[..8];

    private static string GeneratePin() =>
        Random.Shared.Next(1000, 9999).ToString();

    internal static CollectionDto MapToDto(Collection c, int setCount, int mediaCount) => new(
        c.Id, c.Title, c.Description, c.Slug, c.Status,
        c.CoverStyle, c.CoverPhotoId, c.CoverFocalPointX, c.CoverFocalPointY, c.CoverVideoUrl,
        c.Theme, c.FontFamily, c.ColorPalette, c.CustomColorHex, c.Layout,
        c.DownloadsEnabled, c.DownloadPinEnabled, c.DownloadPin,
        c.DownloadLimit, c.DownloadCount, c.AllowedResolutions,
        c.FavoriteLimit, c.SlideshowSpeed, c.SlideshowAutoLoop,
        c.ExpiresAt, c.Language, c.EmbeddingEnabled, c.GoogleAnalyticsPropertyId,
        c.IsStarred, c.RequireEmailRegistration,
        !string.IsNullOrEmpty(c.Password),
        !string.IsNullOrEmpty(c.ClientExclusivePassword),
        c.CreatedAt, c.UpdatedAt, setCount, mediaCount
    );
}
