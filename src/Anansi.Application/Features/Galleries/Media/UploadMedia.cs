using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Media;

// GAL-1.1.1: Upload, GAL-1.1.4: RAW, GAL-1.1.5: Video, GAL-1.1.6: Validation
public record UploadMediaCommand(
    Guid CollectionId,
    Guid? SetId,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    Stream FileStream,
    // Metadata (optional, extracted server-side)
    int? Width,
    int? Height,
    string? CameraMake,
    string? CameraModel,
    string? LensModel,
    double? FocalLength,
    string? Aperture,
    string? ShutterSpeed,
    int? Iso,
    DateTime? DateTaken,
    TimeSpan? Duration,
    string? VideoResolution
) : IRequest<Result<GalleryMediaDto>>;

public class UploadMediaValidator : AbstractValidator<UploadMediaCommand>
{
    private static readonly HashSet<string> SupportedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif"
    };

    private static readonly HashSet<string> SupportedVideoTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-m4v"
    };

    private static readonly HashSet<string> SupportedRawExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2"
    };

    private const long MaxJpegSizeBytes = 50L * 1024 * 1024; // 50MB

    public UploadMediaValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
        RuleFor(x => x.FileName).NotEmpty();
        RuleFor(x => x.ContentType).NotEmpty();
        RuleFor(x => x.FileSizeBytes).GreaterThan(0);

        RuleFor(x => x).Custom((cmd, context) =>
        {
            var ext = System.IO.Path.GetExtension(cmd.FileName);
            var isImage = SupportedImageTypes.Contains(cmd.ContentType);
            var isVideo = SupportedVideoTypes.Contains(cmd.ContentType);
            var isRaw = SupportedRawExtensions.Contains(ext);

            if (!isImage && !isVideo && !isRaw)
            {
                context.AddFailure("ContentType", $"Unsupported file format: {cmd.ContentType} ({ext})");
            }

            if (isImage && cmd.ContentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase)
                && cmd.FileSizeBytes > MaxJpegSizeBytes)
            {
                context.AddFailure("FileSizeBytes", "JPEG files must not exceed 50MB");
            }
        });
    }
}

public class UploadMediaHandler : IRequestHandler<UploadMediaCommand, Result<GalleryMediaDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IStorageService _storage;

    public UploadMediaHandler(IApplicationDbContext db, ICurrentUserService currentUser, IStorageService storage)
    {
        _db = db;
        _currentUser = currentUser;
        _storage = storage;
    }

    public async Task<Result<GalleryMediaDto>> Handle(UploadMediaCommand request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<GalleryMediaDto>.Forbidden("Not authenticated");

        var photographerId = _currentUser.PhotographerId.Value;

        var collection = await _db.Collections
            .FirstOrDefaultAsync(c => c.Id == request.CollectionId && c.PhotographerId == photographerId, ct);

        if (collection is null)
            return Result<GalleryMediaDto>.NotFound("Collection not found");

        if (request.SetId.HasValue)
        {
            var setExists = await _db.CollectionSets.AnyAsync(
                s => s.Id == request.SetId.Value && s.CollectionId == request.CollectionId, ct);
            if (!setExists)
                return Result<GalleryMediaDto>.NotFound("Set not found");
        }

        var storageKey = await _storage.UploadAsync(request.FileStream, request.FileName, request.ContentType, ct);
        var mediaType = DetermineMediaType(request.FileName, request.ContentType);
        var sortOrder = await _db.GalleryMedia.CountAsync(m => m.CollectionId == request.CollectionId, ct);

        var media = new GalleryMedia
        {
            PhotographerId = photographerId,
            CollectionId = request.CollectionId,
            SetId = request.SetId,
            FileName = request.FileName,
            OriginalFileName = request.FileName,
            MediaType = mediaType,
            ContentType = request.ContentType,
            FileSizeBytes = request.FileSizeBytes,
            StorageKey = storageKey,
            Width = request.Width,
            Height = request.Height,
            CameraMake = request.CameraMake,
            CameraModel = request.CameraModel,
            LensModel = request.LensModel,
            FocalLength = request.FocalLength,
            Aperture = request.Aperture,
            ShutterSpeed = request.ShutterSpeed,
            Iso = request.Iso,
            DateTaken = request.DateTaken,
            Duration = request.Duration,
            VideoResolution = request.VideoResolution,
            SortOrder = sortOrder
        };

        _db.GalleryMedia.Add(media);
        await _db.SaveChangesAsync(ct);

        return Result<GalleryMediaDto>.Success(MapToDto(media));
    }

    private static MediaType DetermineMediaType(string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".cr2" or ".cr3" or ".nef" or ".arw" or ".dng" or ".raf" or ".orf" or ".rw2" => MediaType.Raw,
            ".mp4" => MediaType.Mp4,
            ".mov" => MediaType.Mov,
            ".avi" => MediaType.Avi,
            ".m4v" => MediaType.M4V,
            ".png" => MediaType.Png,
            ".gif" => MediaType.Gif,
            _ => MediaType.Jpeg
        };
    }

    internal static GalleryMediaDto MapToDto(GalleryMedia m) => new(
        m.Id, m.CollectionId, m.SetId,
        m.FileName, m.OriginalFileName, m.MediaType, m.ContentType, m.FileSizeBytes,
        m.Width, m.Height, m.CameraMake, m.CameraModel, m.LensModel,
        m.FocalLength, m.Aperture, m.ShutterSpeed, m.Iso, m.DateTaken,
        m.Duration, m.VideoResolution,
        m.SortOrder, m.IsStarred, m.IsPrivate, m.CreatedAt
    );
}
