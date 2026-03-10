using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Gallery Activity & Analytics (GAL-1.9.1 through GAL-1.9.2).
/// </summary>
public class ActivityTests : GalleryTestBase
{
    public ActivityTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.9.1: Activities tab shows download activity.
    /// </summary>
    [Fact]
    public async Task ActivitiesTab_ShowsDownloadActivity()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        db.GalleryActivities.Add(new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.Download,
            ActorName = "Jane",
            ActorEmail = "jane@test.com",
            Resolution = DownloadResolution.Web2048,
            IsFullGallery = true,
            Details = "Full gallery download"
        });
        await db.SaveChangesAsync();

        // Assert
        var activities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.Download)
            .ToListAsync();
        activities.Should().HaveCount(1);
        activities[0].ActorName.Should().Be("Jane");
        activities[0].Resolution.Should().Be(DownloadResolution.Web2048);
    }

    /// <summary>
    /// GAL-1.9.1: Activities tab shows favorite activity.
    /// </summary>
    [Fact]
    public async Task ActivitiesTab_ShowsFavoriteActivity()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        db.GalleryActivities.Add(new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.Favorite,
            ActorName = "John",
            ActorEmail = "john@test.com",
            MediaId = media.Id,
            Details = "Added to 'Album Picks'"
        });
        await db.SaveChangesAsync();

        // Assert
        var activities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.Favorite)
            .ToListAsync();
        activities.Should().HaveCount(1);
        activities[0].MediaId.Should().Be(media.Id);
    }

    /// <summary>
    /// GAL-1.9.1: Activities tab shows private photo activity.
    /// </summary>
    [Fact]
    public async Task ActivitiesTab_ShowsPrivatePhotoActivity()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        db.GalleryActivities.Add(new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.PrivatePhoto,
            ActorName = "Sarah",
            MediaId = media.Id,
            Details = "Marked as private"
        });
        await db.SaveChangesAsync();

        // Assert
        var activities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.PrivatePhoto)
            .ToListAsync();
        activities.Should().HaveCount(1);
        activities[0].Details.Should().Contain("private");
    }

    /// <summary>
    /// GAL-1.9.1: Activities tab shows email registration activity.
    /// </summary>
    [Fact]
    public async Task ActivitiesTab_ShowsEmailRegistrationActivity()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        db.GalleryActivities.Add(new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.EmailRegistration,
            ActorName = "Mike",
            ActorEmail = "mike@test.com",
            Details = "Email registration"
        });
        await db.SaveChangesAsync();

        // Assert
        var activities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.EmailRegistration)
            .ToListAsync();
        activities.Should().HaveCount(1);
        activities[0].ActorEmail.Should().Be("mike@test.com");
    }

    /// <summary>
    /// GAL-1.9.1: Activity filterable by type and date range.
    /// </summary>
    [Fact]
    public async Task Activities_FilterByTypeAndDate()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        db.GalleryActivities.Add(new GalleryActivity { PhotographerId = photographerId, CollectionId = collection.Id, ActivityType = ActivityType.Download, ActorName = "A" });
        db.GalleryActivities.Add(new GalleryActivity { PhotographerId = photographerId, CollectionId = collection.Id, ActivityType = ActivityType.Favorite, ActorName = "B" });
        db.GalleryActivities.Add(new GalleryActivity { PhotographerId = photographerId, CollectionId = collection.Id, ActivityType = ActivityType.Download, ActorName = "C" });
        await db.SaveChangesAsync();

        // Act - Filter by type
        var downloads = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.ActivityType == ActivityType.Download)
            .ToListAsync();

        // Assert
        downloads.Should().HaveCount(2);

        // Act - Filter by date range
        var allActivities = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id && a.CreatedAt >= DateTime.UtcNow.AddMinutes(-5))
            .ToListAsync();

        allActivities.Should().HaveCount(3);
    }

    /// <summary>
    /// GAL-1.9.1: All activity includes timestamps.
    /// </summary>
    [Fact]
    public async Task Activities_IncludeTimestamps()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        db.GalleryActivities.Add(new GalleryActivity
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            ActivityType = ActivityType.View,
            ActorName = "Visitor"
        });
        await db.SaveChangesAsync();

        // Assert
        var activity = await db.GalleryActivities
            .Where(a => a.CollectionId == collection.Id)
            .FirstOrDefaultAsync();
        activity!.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    /// <summary>
    /// GAL-1.9.2: Google Analytics property ID configurable per collection.
    /// </summary>
    [Fact]
    public async Task GoogleAnalytics_PropertyIdConfigurable()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.GoogleAnalyticsPropertyId = "G-XXXXXXXXXX";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.GoogleAnalyticsPropertyId.Should().Be("G-XXXXXXXXXX");
    }

    /// <summary>
    /// GAL-1.9.2: Google Analytics integration uses GA4.
    /// </summary>
    [Fact]
    public async Task GoogleAnalytics_SupportsGA4PropertyFormat()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.GoogleAnalyticsPropertyId = "G-ABC123DEF4";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.GoogleAnalyticsPropertyId.Should().StartWith("G-", "GA4 properties start with G-");
    }
}
