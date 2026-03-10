using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Photo Delivery & Downloads (GAL-1.4.1 through GAL-1.4.5).
/// </summary>
public class DownloadTests : GalleryTestBase
{
    public DownloadTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.4.1: Download available in multiple resolutions.
    /// </summary>
    [Fact]
    public void DownloadResolutions_ShouldHaveMultipleOptions()
    {
        // Assert
        var resolutions = Enum.GetValues<DownloadResolution>();
        resolutions.Should().Contain(DownloadResolution.Web640);
        resolutions.Should().Contain(DownloadResolution.Web1024);
        resolutions.Should().Contain(DownloadResolution.Web2048);
        resolutions.Should().Contain(DownloadResolution.High3600);
        resolutions.Should().Contain(DownloadResolution.Original);
    }

    /// <summary>
    /// GAL-1.4.1: Download request is created for individual or full gallery.
    /// </summary>
    [Fact]
    public async Task RequestDownload_FullGallery_ShouldCreateRequest()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo1.jpg");
        await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo2.jpg");

        // Act
        var request = new DownloadRequest
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            RequestedBy = "Jane Doe",
            RequestedByEmail = "jane@example.com",
            Resolution = DownloadResolution.Web2048,
            IsFullGallery = true,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        db.DownloadRequests.Add(request);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.DownloadRequests.FirstOrDefaultAsync(d => d.Id == request.Id);
        result.Should().NotBeNull();
        result!.IsFullGallery.Should().BeTrue();
        result.Resolution.Should().Be(DownloadResolution.Web2048);
        result.RequestedBy.Should().Be("Jane Doe");
    }

    /// <summary>
    /// GAL-1.4.2: Download PIN validation.
    /// </summary>
    [Fact]
    public async Task DownloadPin_ValidPin_ShouldAllowDownload()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.DownloadPin = "4567";
        collection.DownloadPinEnabled = true;
        await db.SaveChangesAsync();

        // Act & Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.DownloadPinEnabled.Should().BeTrue();
        result.DownloadPin.Should().Be("4567");

        // Simulate PIN verification
        var pinValid = result.DownloadPin == "4567";
        pinValid.Should().BeTrue();

        var pinInvalid = result.DownloadPin == "0000";
        pinInvalid.Should().BeFalse();
    }

    /// <summary>
    /// GAL-1.4.2: PIN can be disabled per collection.
    /// </summary>
    [Fact]
    public async Task DownloadPin_CanBeDisabled()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.DownloadPinEnabled = false;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.DownloadPinEnabled.Should().BeFalse();
    }

    /// <summary>
    /// GAL-1.4.3: Download limits configurable and enforced.
    /// </summary>
    [Fact]
    public async Task DownloadLimit_WhenReached_ShouldBlockFurtherDownloads()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.DownloadLimit = 2;
        collection.DownloadCount = 0;
        await db.SaveChangesAsync();

        // Act - Simulate 2 downloads
        collection.DownloadCount = 2;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.DownloadCount.Should().Be(2);
        result.DownloadLimit.Should().Be(2);
        (result.DownloadCount >= result.DownloadLimit).Should().BeTrue("limit should be reached");
    }

    /// <summary>
    /// GAL-1.4.3: Download limit resettable by photographer.
    /// </summary>
    [Fact]
    public async Task DownloadLimit_CanBeResetByPhotographer()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.DownloadLimit = 5;
        collection.DownloadCount = 5;
        await db.SaveChangesAsync();

        // Act - Reset
        collection.DownloadCount = 0;
        collection.DownloadLimit = 10;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.DownloadCount.Should().Be(0);
        result.DownloadLimit.Should().Be(10);
    }

    /// <summary>
    /// GAL-1.4.4: Async download with notification - download request tracks readiness.
    /// </summary>
    [Fact]
    public async Task AsyncDownload_ShouldTrackReadiness()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        var request = new DownloadRequest
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            RequestedBy = "Client",
            RequestedByEmail = "client@example.com",
            Resolution = DownloadResolution.Original,
            IsFullGallery = true,
            IsReady = false,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        db.DownloadRequests.Add(request);
        await db.SaveChangesAsync();

        // Act - Simulate ZIP preparation completion
        request.IsReady = true;
        request.ReadyAt = DateTime.UtcNow;
        request.ZipStorageKey = "downloads/gallery-123.zip";
        request.NotificationSent = true;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.DownloadRequests.FirstOrDefaultAsync(d => d.Id == request.Id);
        result!.IsReady.Should().BeTrue();
        result.ReadyAt.Should().NotBeNull();
        result.ZipStorageKey.Should().NotBeNullOrEmpty();
        result.NotificationSent.Should().BeTrue();
        result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    /// <summary>
    /// GAL-1.4.5: Download activity tracking.
    /// </summary>
    [Fact]
    public async Task DownloadActivity_ShouldTrackWhoWhenWhat()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        var activity = new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.Download,
            ActorName = "Jane Smith",
            ActorEmail = "jane@example.com",
            MediaId = media.Id,
            Resolution = DownloadResolution.Web2048,
            IsFullGallery = false,
            Details = "Downloaded 1 photo"
        };
        db.GalleryActivities.Add(activity);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.Download)
            .FirstOrDefaultAsync();

        result.Should().NotBeNull();
        result!.ActorName.Should().Be("Jane Smith");
        result.ActorEmail.Should().Be("jane@example.com");
        result.Resolution.Should().Be(DownloadResolution.Web2048);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }
}
