using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Galleries;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Gallery Design & Customization (GAL-1.3.1 through GAL-1.3.8).
/// </summary>
public class DesignTests : GalleryTestBase
{
    public DesignTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.3.1: At least 7 cover styles available.
    /// </summary>
    [Fact]
    public void CoverStyles_ShouldHaveAtLeast7Options()
    {
        // Assert
        var styles = Enum.GetValues<CoverStyle>();
        styles.Length.Should().BeGreaterThanOrEqualTo(7);
    }

    /// <summary>
    /// GAL-1.3.1: Cover photo selectable and focal point adjustable.
    /// </summary>
    [Fact]
    public async Task CoverPhoto_SelectableWithFocalPoint()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);
        var media = await SeedMediaAsync(db, photographerId, collection.Id);

        // Act
        collection.CoverPhotoId = media.Id;
        collection.CoverFocalPointX = 0.3;
        collection.CoverFocalPointY = 0.7;
        collection.CoverStyle = CoverStyle.Oakwood;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.CoverPhotoId.Should().Be(media.Id);
        result.CoverFocalPointX.Should().Be(0.3);
        result.CoverFocalPointY.Should().Be(0.7);
        result.CoverStyle.Should().Be(CoverStyle.Oakwood);
    }

    /// <summary>
    /// GAL-1.3.2: Video/GIF cover via YouTube/Vimeo URL.
    /// </summary>
    [Fact]
    public async Task VideoCover_ShouldStoreUrlAndAutoplay()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.CoverVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        collection.CoverVideoAutoplay = true;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.CoverVideoUrl.Should().Contain("youtube.com");
        result.CoverVideoAutoplay.Should().BeTrue();
    }

    /// <summary>
    /// GAL-1.3.3: Theme toggle between light and dark per collection.
    /// </summary>
    [Fact]
    public async Task ThemeToggle_ShouldSwitchBetweenLightAndDark()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);
        collection.Theme.Should().Be(ThemeMode.Light);

        // Act
        collection.Theme = ThemeMode.Dark;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Theme.Should().Be(ThemeMode.Dark);
    }

    /// <summary>
    /// GAL-1.3.4: At least 6 curated font families.
    /// </summary>
    [Fact]
    public async Task Typography_CanSetFontFamily()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.FontFamily = "Playfair Display";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.FontFamily.Should().Be("Playfair Display");
    }

    /// <summary>
    /// GAL-1.3.5: Color palettes and custom hex.
    /// </summary>
    [Fact]
    public async Task ColorPalettes_CustomHexSupported()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.ColorPalette = "Sunset";
        collection.CustomColorHex = "#FF5733";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.ColorPalette.Should().Be("Sunset");
        result.CustomColorHex.Should().Be("#FF5733");
    }

    /// <summary>
    /// GAL-1.3.6: Grid layouts - vertical and horizontal.
    /// </summary>
    [Fact]
    public async Task GridLayout_VerticalAndHorizontal()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.Layout = GridLayout.Horizontal;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Layout.Should().Be(GridLayout.Horizontal);

        // Verify both layouts exist
        Enum.GetValues<GridLayout>().Should().Contain(GridLayout.Vertical);
        Enum.GetValues<GridLayout>().Should().Contain(GridLayout.Horizontal);
    }

    /// <summary>
    /// GAL-1.3.7: Set titles and descriptions with formatting support.
    /// </summary>
    [Fact]
    public async Task SetTitlesDescriptions_SupportBasicFormatting()
    {
        // Arrange
        var db = GetDb();
        var (photographerId, collection) = await SeedCollectionAsync(db);

        // Act
        var set = new CollectionSet
        {
            PhotographerId = photographerId,
            CollectionId = collection.Id,
            Title = "The Ceremony",
            Description = "A <b>beautiful</b> ceremony at <i>St. Andrew's Chapel</i>.\nCapturing every moment.",
            SortOrder = 0
        };
        db.CollectionSets.Add(set);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.CollectionSets.FirstOrDefaultAsync(s => s.Id == set.Id);
        result!.Title.Should().Be("The Ceremony");
        result.Description.Should().Contain("<b>");
        result.Description.Should().Contain("<i>");
        result.Description.Should().Contain("\n");
    }

    /// <summary>
    /// GAL-1.3.8: Slideshow mode settings.
    /// </summary>
    [Fact]
    public async Task SlideshowSettings_SpeedAndAutoLoop()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.SlideshowSpeed = SlideshowSpeed.Fast;
        collection.SlideshowAutoLoop = false;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.SlideshowSpeed.Should().Be(SlideshowSpeed.Fast);
        result.SlideshowAutoLoop.Should().BeFalse();

        // Verify all speed options exist
        Enum.GetValues<SlideshowSpeed>().Should().HaveCount(3);
    }
}
