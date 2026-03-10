using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

public record UpdateCollectionCommand(
    Guid Id,
    string Title,
    string? Description,
    CollectionStatus Status,
    CoverStyle CoverStyle,
    Guid? CoverPhotoId,
    double? CoverFocalPointX,
    double? CoverFocalPointY,
    string? CoverVideoUrl,
    ThemeMode Theme,
    string FontFamily,
    string ColorPalette,
    string? CustomColorHex,
    GridLayout Layout,
    bool DownloadsEnabled,
    bool DownloadPinEnabled,
    string? DownloadPin,
    int? DownloadLimit,
    string AllowedResolutions,
    int? FavoriteLimit,
    SlideshowSpeed SlideshowSpeed,
    bool SlideshowAutoLoop,
    DateTime? ExpiresAt,
    GalleryLanguage Language,
    bool EmbeddingEnabled,
    string? GoogleAnalyticsPropertyId,
    bool RequireEmailRegistration
) : IRequest<Result<CollectionDto>>;

public class UpdateCollectionValidator : AbstractValidator<UpdateCollectionCommand>
{
    public UpdateCollectionValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(5000);
        RuleFor(x => x.DownloadPin).MaximumLength(10);
    }
}

public class UpdateCollectionHandler : IRequestHandler<UpdateCollectionCommand, Result<CollectionDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateCollectionHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CollectionDto>> Handle(UpdateCollectionCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<CollectionDto>.Forbidden("Not authenticated");

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.PhotographerId == _currentUser.PhotographerId.Value, ct);

        if (collection is null)
            return Result<CollectionDto>.NotFound("Collection not found");

        collection.Title = request.Title;
        collection.Description = request.Description;
        collection.Status = request.Status;
        collection.CoverStyle = request.CoverStyle;
        collection.CoverPhotoId = request.CoverPhotoId;
        collection.CoverFocalPointX = request.CoverFocalPointX;
        collection.CoverFocalPointY = request.CoverFocalPointY;
        collection.CoverVideoUrl = request.CoverVideoUrl;
        collection.Theme = request.Theme;
        collection.FontFamily = request.FontFamily;
        collection.ColorPalette = request.ColorPalette;
        collection.CustomColorHex = request.CustomColorHex;
        collection.Layout = request.Layout;
        collection.DownloadsEnabled = request.DownloadsEnabled;
        collection.DownloadPinEnabled = request.DownloadPinEnabled;
        collection.DownloadPin = request.DownloadPin ?? collection.DownloadPin;
        collection.DownloadLimit = request.DownloadLimit;
        collection.AllowedResolutions = request.AllowedResolutions;
        collection.FavoriteLimit = request.FavoriteLimit;
        collection.SlideshowSpeed = request.SlideshowSpeed;
        collection.SlideshowAutoLoop = request.SlideshowAutoLoop;
        collection.ExpiresAt = request.ExpiresAt;
        collection.Language = request.Language;
        collection.EmbeddingEnabled = request.EmbeddingEnabled;
        collection.GoogleAnalyticsPropertyId = request.GoogleAnalyticsPropertyId;
        collection.RequireEmailRegistration = request.RequireEmailRegistration;

        await _db.SaveChangesAsync(ct);

        var setCount = await _db.CollectionSets.CountAsync(s => s.CollectionId == collection.Id, ct);
        var mediaCount = await _db.GalleryMedia.CountAsync(m => m.CollectionId == collection.Id, ct);

        return Result<CollectionDto>.Success(CreateCollectionHandler.MapToDto(collection, setCount, mediaCount));
    }
}
