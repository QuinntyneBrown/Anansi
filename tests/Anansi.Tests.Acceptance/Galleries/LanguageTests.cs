using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Galleries;

/// <summary>
/// Acceptance tests for Multi-Language Support (GAL-1.8.1).
/// </summary>
public class LanguageTests : GalleryTestBase
{
    public LanguageTests(TestWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// GAL-1.8.1: At least 8 languages available.
    /// </summary>
    [Fact]
    public void Languages_ShouldHaveAtLeast8Options()
    {
        // Assert
        var languages = Enum.GetValues<GalleryLanguage>();
        languages.Length.Should().BeGreaterThanOrEqualTo(8);
    }

    /// <summary>
    /// GAL-1.8.1: Required languages are available.
    /// </summary>
    [Fact]
    public void Languages_ShouldIncludeRequiredOptions()
    {
        var languages = Enum.GetValues<GalleryLanguage>();
        languages.Should().Contain(GalleryLanguage.English);
        languages.Should().Contain(GalleryLanguage.Spanish);
        languages.Should().Contain(GalleryLanguage.French);
        languages.Should().Contain(GalleryLanguage.German);
        languages.Should().Contain(GalleryLanguage.Dutch);
        languages.Should().Contain(GalleryLanguage.ChineseSimplified);
        languages.Should().Contain(GalleryLanguage.Portuguese);
        languages.Should().Contain(GalleryLanguage.Swedish);
    }

    /// <summary>
    /// GAL-1.8.1: Language can be set per collection.
    /// </summary>
    [Fact]
    public async Task Language_CanBeSetPerCollection()
    {
        // Arrange
        var db = GetDb();
        var (_, collection) = await SeedCollectionAsync(db);

        // Act
        collection.Language = GalleryLanguage.Spanish;
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id);
        result!.Language.Should().Be(GalleryLanguage.Spanish);
    }

    /// <summary>
    /// GAL-1.8.1: Language can be set as default via presets.
    /// </summary>
    [Fact]
    public async Task Language_CanBeSetAsDefaultViaPreset()
    {
        // Arrange
        var db = GetDb();
        var photographerId = Guid.NewGuid();
        var preset = new Domain.Entities.Galleries.CollectionPreset
        {
            PhotographerId = photographerId,
            Name = "French Default",
            Language = GalleryLanguage.French,
            FontFamily = "Inter"
        };
        db.CollectionPresets.Add(preset);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.CollectionPresets.FirstOrDefaultAsync(p => p.Id == preset.Id);
        result!.Language.Should().Be(GalleryLanguage.French);
    }
}
