using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Gallery Organization (GAL-1.2.1 through GAL-1.2.4).
/// </summary>
public class OrganizationTests : GalleryTestBase
{
    public OrganizationTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.2.1: Collections have title, description, configurable settings.
    /// </summary>
    [Fact]
    public async Task CreateCollection_WithTitleAndDescription_ShouldPersist()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();

        // Act
        var collection = new Collection
        {
            PhotographerId = photographerId,
            Title = "Smith Wedding",
            Description = "Wedding photos for John & Jane Smith",
            Slug = "smith-wedding-" + Guid.NewGuid().ToString("N")[..8],
            Status = CollectionStatus.Draft,
            Theme = ThemeMode.Light,
            Layout = GridLayout.Vertical,
            Language = GalleryLanguage.English
        };
        db.Collections.Add(collection);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result.Should().NotBeNull();
        result!.Title.Should().Be("Smith Wedding");
        result.Description.Should().Be("Wedding photos for John & Jane Smith");
        result.Status.Should().Be(CollectionStatus.Draft);
    }

    /// <summary>
    /// GAL-1.2.1: Sets within collection independently titled and described.
    /// </summary>
    [Fact]
    public async Task CreateSets_IndependentlyTitledAndOrdered()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var set1 = await SeedSetAsync(db, photographerId, collection.Id, "Getting Ready", 0);
        var set2 = await SeedSetAsync(db, photographerId, collection.Id, "Ceremony", 1);
        var set3 = await SeedSetAsync(db, photographerId, collection.Id, "Reception", 2);

        // Assert
        var sets = await db.CollectionSets
            .Where(s => s.CollectionId == collection.Id)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        sets.Should().HaveCount(3);
        sets[0].Title.Should().Be("Getting Ready");
        sets[1].Title.Should().Be("Ceremony");
        sets[2].Title.Should().Be("Reception");
    }

    /// <summary>
    /// GAL-1.2.1: Photos can be moved between sets.
    /// </summary>
    [Fact]
    public async Task MoveMedia_BetweenSets_ShouldUpdateSetId()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var set1 = await SeedSetAsync(db, photographerId, collection.Id, "Set A", 0);
        var set2 = await SeedSetAsync(db, photographerId, collection.Id, "Set B", 1);
        var media = await SeedMediaAsync(db, photographerId, collection.Id, set1.Id);

        // Act
        media.SetId = set2.Id;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result!.SetId.Should().Be(set2.Id);
    }

    /// <summary>
    /// GAL-1.2.1: Sets are manually sortable.
    /// </summary>
    [Fact]
    public async Task ReorderSets_ShouldUpdateSortOrder()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var set1 = await SeedSetAsync(db, photographerId, collection.Id, "First", 0);
        var set2 = await SeedSetAsync(db, photographerId, collection.Id, "Second", 1);
        var set3 = await SeedSetAsync(db, photographerId, collection.Id, "Third", 2);

        // Act - Reorder: Third, First, Second
        set3.SortOrder = 0;
        set1.SortOrder = 1;
        set2.SortOrder = 2;
        await db.SaveChangesAsync();

        // Assert
        var ordered = await db.CollectionSets
            .Where(s => s.CollectionId == collection.Id)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        ordered[0].Title.Should().Be("Third");
        ordered[1].Title.Should().Be("First");
        ordered[2].Title.Should().Be("Second");
    }

    /// <summary>
    /// GAL-1.2.2: Bulk gallery creation with settings.
    /// </summary>
    [Fact]
    public async Task BulkCreateGalleries_ShouldCreateMultipleCollections()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();

        // Act
        var collections = new List<Collection>();
        for (int i = 0; i < 3; i++)
        {
            var c = new Collection
            {
                PhotographerId = photographerId,
                Title = $"Wedding {i + 1}",
                Slug = $"wedding-{i + 1}-{Guid.NewGuid().ToString("N")[..8]}",
                Theme = ThemeMode.Dark,
                Layout = GridLayout.Horizontal,
                DownloadPin = "1234"
            };
            collections.Add(c);
            db.Collections.Add(c);
        }
        await db.SaveChangesAsync();

        // Assert
        var results = await db.Collections
            .Where(c => c.PhotographerId == photographerId)
            .ToListAsync();

        results.Should().HaveCount(3);
        results.Should().AllSatisfy(c =>
        {
            c.Theme.Should().Be(ThemeMode.Dark);
            c.Layout.Should().Be(GridLayout.Horizontal);
        });
    }

    /// <summary>
    /// GAL-1.2.3: Star/bookmark collections.
    /// </summary>
    [Fact]
    public async Task StarCollection_ShouldToggleIsStarred()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        collection.IsStarred.Should().BeFalse();

        // Act
        collection.IsStarred = true;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.IsStarred.Should().BeTrue();
    }

    /// <summary>
    /// GAL-1.2.3: Star individual photos, bulk starring.
    /// </summary>
    [Fact]
    public async Task BulkStarMedia_ShouldMarkMultiplePhotos()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media1 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo1.jpg");
        var media2 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo2.jpg");
        var media3 = await SeedMediaAsync(db, photographerId, collection.Id, fileName: "photo3.jpg");

        // Act
        media1.IsStarred = true;
        media2.IsStarred = true;
        media3.IsStarred = true;
        await db.SaveChangesAsync();

        // Assert
        var starred = await db.GalleryMedia
            .Where(m => m.CollectionId == collection.Id && m.IsStarred)
            .ToListAsync();

        starred.Should().HaveCount(3);
    }

    /// <summary>
    /// GAL-1.2.3: Unstarring removes items from Starred tab immediately.
    /// </summary>
    [Fact]
    public async Task UnstarMedia_ShouldRemoveFromStarred()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);
        media.IsStarred = true;
        await db.SaveChangesAsync();

        // Act
        media.IsStarred = false;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GalleryMedia.FirstOrDefaultAsync(m => m.Id == media.Id);
        result!.IsStarred.Should().BeFalse();
    }

    /// <summary>
    /// GAL-1.2.4: Collection presets - save and apply.
    /// </summary>
    [Fact]
    public async Task CollectionPreset_SaveAndApply_ShouldPersistSettings()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();

        // Act - Save preset
        var preset = new CollectionPreset
        {
            PhotographerId = photographerId,
            Name = "Dark Wedding Preset",
            CoverStyle = CoverStyle.Edge,
            Theme = ThemeMode.Dark,
            FontFamily = "Playfair Display",
            ColorPalette = "Midnight",
            Layout = GridLayout.Horizontal,
            DownloadsEnabled = true,
            DownloadPinEnabled = true,
            AllowedResolutions = "Web640,Web1024,Web2048,High3600",
            Language = GalleryLanguage.English
        };
        db.CollectionPresets.Add(preset);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.CollectionPresets.FirstOrDefaultAsync(p => p.Id == preset.Id);
        result.Should().NotBeNull();
        result!.Name.Should().Be("Dark Wedding Preset");
        result.Theme.Should().Be(ThemeMode.Dark);
        result.FontFamily.Should().Be("Playfair Display");
    }

    /// <summary>
    /// GAL-1.2.4: Multiple presets manageable (rename, delete, update).
    /// </summary>
    [Fact]
    public async Task CollectionPreset_RenameAndDelete_ShouldWork()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();
        var preset = new CollectionPreset
        {
            PhotographerId = photographerId,
            Name = "Original Name",
            Theme = ThemeMode.Light,
            FontFamily = "Inter"
        };
        db.CollectionPresets.Add(preset);
        await db.SaveChangesAsync();

        // Act - Rename
        preset.Name = "Updated Name";
        await db.SaveChangesAsync();

        var renamed = await db.CollectionPresets.FirstOrDefaultAsync(p => p.Id == preset.Id);
        renamed!.Name.Should().Be("Updated Name");

        // Act - Soft delete
        preset.IsDeleted = true;
        preset.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Assert - Should be filtered by soft-delete
        var deleted = await db.CollectionPresets.FirstOrDefaultAsync(p => p.Id == preset.Id);
        deleted.Should().BeNull("soft-deleted presets should be filtered");
    }
}
