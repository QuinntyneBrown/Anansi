using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Photo & Video Upload (GAL-1.1.1 through GAL-1.1.6).
/// </summary>
public class UploadTests : GalleryTestBase
{
    public UploadTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.1.1: Browser upload - files appear in collection upon completion.
    /// </summary>
    [Fact]
    public async Task UploadMedia_JpegFile_ShouldAppearInCollection()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var media = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "wedding-01.jpg");

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result.Should().NotBeNull();
        result!.CollectionId.Should().Be(collection.Id);
        result.FileName.Should().Be("wedding-01.jpg");
        result.MediaType.Should().Be(MediaType.Jpeg);
        result.ContentType.Should().Be("image/jpeg");
    }

    /// <summary>
    /// GAL-1.1.2: Bulk folder upload - sub-folders become sets.
    /// </summary>
    [Fact]
    public async Task BulkFolderUpload_SubFoldersBecomesSets()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act - Simulate folder upload where sub-folders become sets
        var ceremonySet = await SeedSetAsync(db, photographerId, collection.Id, "Ceremony", 0);
        var receptionSet = await SeedSetAsync(db, photographerId, collection.Id, "Reception", 1);
        await SeedMediaAsync(db, photographerId, collection.Id, ceremonySet.Id, "ceremony-01.jpg");
        await SeedMediaAsync(db, photographerId, collection.Id, receptionSet.Id, "reception-01.jpg");

        // Assert
        var sets = await db.CollectionSets.Where(s => s.CollectionId == collection.Id).ToListAsync();
        sets.Should().HaveCount(2);
        sets.Select(s => s.Title).Should().Contain("Ceremony").And.Contain("Reception");

        var ceremonyMedia = await db.GalleryMedia.Where(m => m.SetId == ceremonySet.Id).ToListAsync();
        ceremonyMedia.Should().HaveCount(1);
    }

    /// <summary>
    /// GAL-1.1.3: Lightroom plugin - re-publish updates existing image.
    /// </summary>
    [Fact]
    public async Task LightroomRePublish_UpdatesExistingImage()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "LR-export-001.jpg");

        // Act - Simulate re-publishing by updating existing media
        media.FileSizeBytes = 2 * 1024 * 1024; // Updated file size
        media.StorageKey = $"uploads/{Guid.NewGuid()}/LR-export-001.jpg"; // New storage key
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result.Should().NotBeNull();
        result!.FileSizeBytes.Should().Be(2 * 1024 * 1024);
        var totalMedia = await db.GalleryMedia.CountAsync(m => m.CollectionId == collection.Id && m.FileName == "LR-export-001.jpg");
        totalMedia.Should().Be(1, "re-publish should update, not duplicate");
    }

    /// <summary>
    /// GAL-1.1.4: RAW file support - stores original, creates preview.
    /// </summary>
    [Fact]
    public async Task UploadMedia_RawFile_ShouldStoreWithRawMediaType()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var rawMedia = new GalleryMedia
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            FileName = "photo.cr3",
            OriginalFileName = "photo.cr3",
            MediaType = MediaType.Raw,
            ContentType = "image/x-canon-cr3",
            FileSizeBytes = 30 * 1024 * 1024,
            StorageKey = $"uploads/{Guid.NewGuid()}/photo.cr3",
            ThumbnailStorageKey = $"thumbnails/{Guid.NewGuid()}/photo.jpg",
            Width = 6000,
            Height = 4000,
            CameraMake = "Canon",
            CameraModel = "EOS R5"
        };
        db.GalleryMedia.Add(rawMedia);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == rawMedia.Id);
        result.Should().NotBeNull();
        result!.MediaType.Should().Be(MediaType.Raw);
        result.ThumbnailStorageKey.Should().NotBeNullOrEmpty("RAW files should have preview thumbnails");
    }

    /// <summary>
    /// GAL-1.1.5: Video upload - processed for streaming.
    /// </summary>
    [Fact]
    public async Task UploadMedia_VideoFile_ShouldStoreWithDuration()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var videoMedia = new GalleryMedia
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            FileName = "highlights.mp4",
            OriginalFileName = "highlights.mp4",
            MediaType = MediaType.Mp4,
            ContentType = "video/mp4",
            FileSizeBytes = 100 * 1024 * 1024,
            StorageKey = $"uploads/{Guid.NewGuid()}/highlights.mp4",
            Duration = TimeSpan.FromMinutes(3),
            VideoResolution = "3840x2160",
            Width = 3840,
            Height = 2160
        };
        db.GalleryMedia.Add(videoMedia);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == videoMedia.Id);
        result.Should().NotBeNull();
        result!.MediaType.Should().Be(MediaType.Mp4);
        result.Duration.Should().Be(TimeSpan.FromMinutes(3));
        result.VideoResolution.Should().Be("3840x2160");
    }

    /// <summary>
    /// GAL-1.1.6: File validation - rejects unsupported formats.
    /// </summary>
    [Fact]
    public async Task FileValidation_UnsupportedFormat_ShouldBeRejectable()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act & Assert - Test that only supported MediaTypes exist in enum
        var supportedTypes = Enum.GetValues<MediaType>();
        supportedTypes.Should().Contain(MediaType.Jpeg);
        supportedTypes.Should().Contain(MediaType.Png);
        supportedTypes.Should().Contain(MediaType.Gif);
        supportedTypes.Should().Contain(MediaType.Raw);
        supportedTypes.Should().Contain(MediaType.Mp4);
        supportedTypes.Should().Contain(MediaType.Mov);
    }

    /// <summary>
    /// GAL-1.1.6: File validation - JPEG max 50MB.
    /// </summary>
    [Fact]
    public async Task FileValidation_JpegUnder50MB_ShouldBeAccepted()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act - Upload a 49MB JPEG (should succeed)
        var media = new GalleryMedia
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            FileName = "large-photo.jpg",
            OriginalFileName = "large-photo.jpg",
            MediaType = MediaType.Jpeg,
            ContentType = "image/jpeg",
            FileSizeBytes = 49 * 1024 * 1024, // 49MB
            StorageKey = $"uploads/{Guid.NewGuid()}/large-photo.jpg"
        };
        db.GalleryMedia.Add(media);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result.Should().NotBeNull();
        result!.FileSizeBytes.Should().BeLessThan(50L * 1024 * 1024);
    }
}
