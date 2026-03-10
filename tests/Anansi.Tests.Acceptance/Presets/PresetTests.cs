using System.Net.Http.Json;
using Anansi.Application.Common;
using Anansi.Application.DTOs.Presets;
using Anansi.Application.Features.Presets.Commands;
using Anansi.Application.Features.Presets.Queries;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Presets;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Presets;

/// <summary>
/// Acceptance tests for skin tone preset library (PRE-23.1.1 through PRE-23.3.3).
/// </summary>
public class PresetTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public PresetTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static readonly string DefaultHsl = """
    [
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0},
      {"Hue":0,"Saturation":0,"Luminance":0}
    ]
    """;

    #region PRE-23.1.1 - Create Editing Preset

    [Fact]
    public async Task CreatePreset_WithValidData_ShouldReturn201WithPreset()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var request = new CreateEditingPresetRequest(
            Name: "Golden Hour Deep Skin",
            Description: "Warm tones for deep skin in golden hour",
            SkinToneRange: SkinToneRange.Deep,
            ShootingContext: ShootingContext.GoldenHour,
            IsPublic: true,
            Temperature: 6200,
            Tint: 8,
            Exposure: 0.3,
            Contrast: -10,
            Highlights: -25,
            Shadows: 30,
            Whites: -15,
            Blacks: 20,
            Clarity: 5,
            Vibrance: 10,
            Saturation: -5,
            HslAdjustments: DefaultHsl,
            SplitToneHighlightHue: 45,
            SplitToneHighlightSaturation: 20,
            SplitToneShadowHue: 230,
            SplitToneShadowSaturation: 15);

        // Act
        var result = await mediator.Send(new CreateEditingPresetCommand(request));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Golden Hour Deep Skin");
        result.Value.SkinToneRange.Should().Be(SkinToneRange.Deep);
        result.Value.ShootingContext.Should().Be(ShootingContext.GoldenHour);
        result.Value.IsPublic.Should().BeTrue();
        result.Value.IsSystemPreset.Should().BeFalse();
        result.Value.Temperature.Should().Be(6200);
        result.Value.Tint.Should().Be(8);
        result.Value.Exposure.Should().Be(0.3);
        result.Value.Contrast.Should().Be(-10);
        result.Value.Highlights.Should().Be(-25);
        result.Value.Shadows.Should().Be(30);
        result.Value.SplitToneHighlightHue.Should().Be(45);
        result.Value.SplitToneShadowHue.Should().Be(230);
    }

    [Fact]
    public async Task CreatePreset_ShouldSupportAllSkinToneRanges()
    {
        using var scope = _factory.Services.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var skinTones = new[] { SkinToneRange.Light, SkinToneRange.Medium, SkinToneRange.Deep, SkinToneRange.VeryDeep };

        foreach (var tone in skinTones)
        {
            var request = new CreateEditingPresetRequest(
                $"Test {tone}", null, tone, ShootingContext.StudioPortrait, false,
                5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
            var result = await mediator.Send(new CreateEditingPresetCommand(request));
            result.IsSuccess.Should().BeTrue();
            result.Value!.SkinToneRange.Should().Be(tone);
        }
    }

    [Fact]
    public async Task CreatePreset_ShouldSupportAllShootingContexts()
    {
        using var scope = _factory.Services.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var contexts = new[] { ShootingContext.StudioPortrait, ShootingContext.OutdoorNatural, ShootingContext.EventReception, ShootingContext.GoldenHour, ShootingContext.LowLight, ShootingContext.Flash };

        foreach (var ctx in contexts)
        {
            var request = new CreateEditingPresetRequest(
                $"Test {ctx}", null, SkinToneRange.Light, ctx, false,
                5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
            var result = await mediator.Send(new CreateEditingPresetCommand(request));
            result.IsSuccess.Should().BeTrue();
            result.Value!.ShootingContext.Should().Be(ctx);
        }
    }

    #endregion

    #region PRE-23.2.1 - Browse Presets by Category

    [Fact]
    public async Task GetPresets_FilterBySkinToneAndContext_ShouldReturnFiltered()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // Seed a few presets with different categories
        var deepGolden = CreateSeedPreset("Deep Golden", SkinToneRange.Deep, ShootingContext.GoldenHour, isPublic: true);
        var lightStudio = CreateSeedPreset("Light Studio", SkinToneRange.Light, ShootingContext.StudioPortrait, isPublic: true);
        var deepStudio = CreateSeedPreset("Deep Studio", SkinToneRange.Deep, ShootingContext.StudioPortrait, isPublic: true);

        db.EditingPresets.Add(deepGolden);
        db.EditingPresets.Add(lightStudio);
        db.EditingPresets.Add(deepStudio);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(
            SkinToneRange.Deep, ShootingContext.GoldenHour, null, 1, 20));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().Contain(p => p.Name == "Deep Golden");
        result.Value.Items.Should().NotContain(p => p.Name == "Light Studio");
        result.Value.Items.Should().NotContain(p => p.Name == "Deep Studio");
    }

    [Fact]
    public async Task GetPresets_ShouldReturnPublicAndOwnPrivatePresets()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var ownPrivate = CreateSeedPreset("Own Private", SkinToneRange.Medium, ShootingContext.Flash, isPublic: false);
        ownPrivate.PhotographerId = TestWebApplicationFactory.TestPhotographerId;

        var otherPrivate = CreateSeedPreset("Other Private", SkinToneRange.Medium, ShootingContext.Flash, isPublic: false);
        otherPrivate.PhotographerId = Guid.NewGuid();

        var otherPublic = CreateSeedPreset("Other Public", SkinToneRange.Medium, ShootingContext.Flash, isPublic: true);
        otherPublic.PhotographerId = Guid.NewGuid();

        db.EditingPresets.Add(ownPrivate);
        db.EditingPresets.Add(otherPrivate);
        db.EditingPresets.Add(otherPublic);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(
            SkinToneRange.Medium, ShootingContext.Flash, null, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().Contain(p => p.Name == "Own Private");
        result.Value.Items.Should().Contain(p => p.Name == "Other Public");
        result.Value.Items.Should().NotContain(p => p.Name == "Other Private");
    }

    [Fact]
    public async Task GetPresets_ShouldBeOrderedByFavoriteCount()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var popular = CreateSeedPreset("Popular Preset", SkinToneRange.VeryDeep, ShootingContext.LowLight, isPublic: true);
        popular.FavoriteCount = 100;

        var unpopular = CreateSeedPreset("Unpopular Preset", SkinToneRange.VeryDeep, ShootingContext.LowLight, isPublic: true);
        unpopular.FavoriteCount = 1;

        db.EditingPresets.Add(popular);
        db.EditingPresets.Add(unpopular);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(
            SkinToneRange.VeryDeep, ShootingContext.LowLight, null, 1, 20));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var items = result.Value!.Items.ToList();
        var popularIdx = items.FindIndex(p => p.Name == "Popular Preset");
        var unpopularIdx = items.FindIndex(p => p.Name == "Unpopular Preset");
        popularIdx.Should().BeLessThan(unpopularIdx);
    }

    [Fact]
    public async Task GetPresets_ShouldIncludeIsFavoritedFlag()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var preset = CreateSeedPreset("Favorited Test", SkinToneRange.Light, ShootingContext.OutdoorNatural, isPublic: true);
        db.EditingPresets.Add(preset);
        await db.SaveChangesAsync();

        db.PresetFavorites.Add(new PresetFavorite
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            PresetId = preset.Id
        });
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(
            SkinToneRange.Light, ShootingContext.OutdoorNatural, null, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var item = result.Value!.Items.FirstOrDefault(p => p.Name == "Favorited Test");
        item.Should().NotBeNull();
        item!.IsFavorited.Should().BeTrue();
    }

    #endregion

    #region PRE-23.2.2 - Favorite / Unfavorite

    [Fact]
    public async Task FavoritePreset_ShouldReturn200()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var preset = CreateSeedPreset("Fav Target", SkinToneRange.Medium, ShootingContext.StudioPortrait, isPublic: true);
        db.EditingPresets.Add(preset);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new FavoritePresetCommand(preset.Id));

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify favorite count incremented
        var updated = await db.EditingPresets.FindAsync(preset.Id);
        updated!.FavoriteCount.Should().Be(1);
    }

    [Fact]
    public async Task UnfavoritePreset_ShouldRemoveFavorite()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var preset = CreateSeedPreset("Unfav Target", SkinToneRange.Medium, ShootingContext.StudioPortrait, isPublic: true);
        preset.FavoriteCount = 1;
        db.EditingPresets.Add(preset);
        await db.SaveChangesAsync();

        db.PresetFavorites.Add(new PresetFavorite
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            PresetId = preset.Id
        });
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new UnfavoritePresetCommand(preset.Id));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var updated = await db.EditingPresets.FindAsync(preset.Id);
        updated!.FavoriteCount.Should().Be(0);
    }

    [Fact]
    public async Task GetFavorites_ShouldReturnUserFavorites()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var preset1 = CreateSeedPreset("My Fav 1", SkinToneRange.Deep, ShootingContext.GoldenHour, isPublic: true);
        var preset2 = CreateSeedPreset("My Fav 2", SkinToneRange.Light, ShootingContext.Flash, isPublic: true);
        var presetNotFav = CreateSeedPreset("Not My Fav", SkinToneRange.Medium, ShootingContext.LowLight, isPublic: true);

        db.EditingPresets.Add(preset1);
        db.EditingPresets.Add(preset2);
        db.EditingPresets.Add(presetNotFav);
        await db.SaveChangesAsync();

        db.PresetFavorites.Add(new PresetFavorite { PhotographerId = TestWebApplicationFactory.TestPhotographerId, PresetId = preset1.Id });
        db.PresetFavorites.Add(new PresetFavorite { PhotographerId = TestWebApplicationFactory.TestPhotographerId, PresetId = preset2.Id });
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetFavoritePresetsQuery(1, 20));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().Contain(p => p.Name == "My Fav 1");
        result.Value.Items.Should().Contain(p => p.Name == "My Fav 2");
        result.Value.Items.Should().NotContain(p => p.Name == "Not My Fav");
        result.Value.Items.Should().AllSatisfy(p => p.IsFavorited.Should().BeTrue());
    }

    #endregion

    #region PRE-23.2.3 - Get Preset Detail

    [Fact]
    public async Task GetPresetById_ShouldReturnCompletePresetWithAllAdjustments()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var request = new CreateEditingPresetRequest(
            Name: "Detail Test",
            Description: "Full detail",
            SkinToneRange: SkinToneRange.Deep,
            ShootingContext: ShootingContext.EventReception,
            IsPublic: true,
            Temperature: 5800,
            Tint: -3,
            Exposure: 0.5,
            Contrast: 15,
            Highlights: -40,
            Shadows: 35,
            Whites: -10,
            Blacks: 25,
            Clarity: 10,
            Vibrance: 15,
            Saturation: -8,
            HslAdjustments: DefaultHsl,
            SplitToneHighlightHue: 50,
            SplitToneHighlightSaturation: 25,
            SplitToneShadowHue: 240,
            SplitToneShadowSaturation: 20);

        var createResult = await mediator.Send(new CreateEditingPresetCommand(request));
        createResult.IsSuccess.Should().BeTrue();

        // Act
        var result = await mediator.Send(new GetEditingPresetByIdQuery(createResult.Value!.Id));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value!;
        dto.Name.Should().Be("Detail Test");
        dto.Description.Should().Be("Full detail");
        dto.Temperature.Should().Be(5800);
        dto.Tint.Should().Be(-3);
        dto.Exposure.Should().Be(0.5);
        dto.Contrast.Should().Be(15);
        dto.Highlights.Should().Be(-40);
        dto.Shadows.Should().Be(35);
        dto.Whites.Should().Be(-10);
        dto.Blacks.Should().Be(25);
        dto.Clarity.Should().Be(10);
        dto.Vibrance.Should().Be(15);
        dto.Saturation.Should().Be(-8);
        dto.HslAdjustments.Should().NotBeNullOrEmpty();
        dto.SplitToneHighlightHue.Should().Be(50);
        dto.SplitToneHighlightSaturation.Should().Be(25);
        dto.SplitToneShadowHue.Should().Be(240);
        dto.SplitToneShadowSaturation.Should().Be(20);
    }

    #endregion

    #region PRE-23.3.1 - Update Own Preset

    [Fact]
    public async Task UpdatePreset_ByOwner_ShouldReturn200()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var createRequest = new CreateEditingPresetRequest(
            "Update Target", null, SkinToneRange.Light, ShootingContext.StudioPortrait, false,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var created = await mediator.Send(new CreateEditingPresetCommand(createRequest));
        created.IsSuccess.Should().BeTrue();

        // Act
        var updateRequest = new UpdateEditingPresetRequest(
            "Updated Name", "Updated desc", SkinToneRange.Medium, ShootingContext.GoldenHour, true,
            6000, 5, 0.2, -5, -10, 15, -8, 12, 3, 8, -3, DefaultHsl, 40, 15, 220, 10);
        var result = await mediator.Send(new UpdateEditingPresetCommand(created.Value!.Id, updateRequest));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Updated Name");
        result.Value.Description.Should().Be("Updated desc");
        result.Value.SkinToneRange.Should().Be(SkinToneRange.Medium);
        result.Value.ShootingContext.Should().Be(ShootingContext.GoldenHour);
        result.Value.IsPublic.Should().BeTrue();
        result.Value.Temperature.Should().Be(6000);
    }

    [Fact]
    public async Task UpdatePreset_NotOwner_ShouldReturn403()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var otherPreset = CreateSeedPreset("Other's Preset", SkinToneRange.Light, ShootingContext.Flash, isPublic: true);
        otherPreset.PhotographerId = Guid.NewGuid();
        db.EditingPresets.Add(otherPreset);
        await db.SaveChangesAsync();

        // Act
        var updateRequest = new UpdateEditingPresetRequest(
            "Hijacked", null, SkinToneRange.Light, ShootingContext.Flash, true,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var result = await mediator.Send(new UpdateEditingPresetCommand(otherPreset.Id, updateRequest));

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    #endregion

    #region PRE-23.3.2 - Delete Own Preset

    [Fact]
    public async Task DeletePreset_ByOwner_ShouldReturn204SoftDelete()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var createRequest = new CreateEditingPresetRequest(
            "Delete Target", null, SkinToneRange.Deep, ShootingContext.LowLight, false,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var created = await mediator.Send(new CreateEditingPresetCommand(createRequest));
        created.IsSuccess.Should().BeTrue();

        // Act
        var result = await mediator.Send(new DeleteEditingPresetCommand(created.Value!.Id));

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify soft delete - should not appear in normal query
        var getResult = await mediator.Send(new GetEditingPresetByIdQuery(created.Value.Id));
        getResult.IsSuccess.Should().BeFalse();
        getResult.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task DeletePreset_NotOwner_ShouldReturn403()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var otherPreset = CreateSeedPreset("Other Delete", SkinToneRange.Light, ShootingContext.Flash, isPublic: true);
        otherPreset.PhotographerId = Guid.NewGuid();
        db.EditingPresets.Add(otherPreset);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new DeleteEditingPresetCommand(otherPreset.Id));

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task DeletePreset_SystemPreset_ShouldReturn403()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var systemPreset = CreateSeedPreset("System Preset", SkinToneRange.Light, ShootingContext.StudioPortrait, isPublic: true);
        systemPreset.IsSystemPreset = true;
        systemPreset.PhotographerId = null;
        db.EditingPresets.Add(systemPreset);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new DeleteEditingPresetCommand(systemPreset.Id));

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    #endregion

    #region PRE-23.3.3 - System Presets

    [Fact]
    public async Task SystemPresets_ShouldExistAfterSeeding()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        SeedSystemPresets(db);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(null, null, true, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Count.Should().BeGreaterThanOrEqualTo(8);
        result.Value.Items.Should().AllSatisfy(p => p.IsSystemPreset.Should().BeTrue());
    }

    [Fact]
    public async Task SystemPresets_ShouldCoverAllSkinToneRanges()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        SeedSystemPresets(db);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(null, null, true, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var items = result.Value!.Items;
        items.Should().Contain(p => p.SkinToneRange == SkinToneRange.Light);
        items.Should().Contain(p => p.SkinToneRange == SkinToneRange.Medium);
        items.Should().Contain(p => p.SkinToneRange == SkinToneRange.Deep);
        items.Should().Contain(p => p.SkinToneRange == SkinToneRange.VeryDeep);
    }

    [Fact]
    public async Task SystemPresets_ShouldCoverMultipleContexts()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        SeedSystemPresets(db);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(null, null, true, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        var contexts = result.Value!.Items.Select(p => p.ShootingContext).Distinct().ToList();
        contexts.Count.Should().BeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task SystemPresets_FilterByIsSystem_ShouldReturnOnlySystem()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        SeedSystemPresets(db);

        // Add a user preset too
        var userPreset = CreateSeedPreset("User Preset", SkinToneRange.Light, ShootingContext.StudioPortrait, isPublic: true);
        userPreset.PhotographerId = TestWebApplicationFactory.TestPhotographerId;
        db.EditingPresets.Add(userPreset);
        await db.SaveChangesAsync();

        // Act
        var result = await mediator.Send(new GetEditingPresetsQuery(null, null, true, 1, 50));

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().AllSatisfy(p => p.IsSystemPreset.Should().BeTrue());
        result.Value.Items.Should().NotContain(p => p.Name == "User Preset");
    }

    #endregion

    #region HTTP Integration Tests

    [Fact]
    public async Task PostPresets_HttpEndpoint_ShouldReturn201()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new CreateEditingPresetRequest(
            "HTTP Test Preset", "Via HTTP", SkinToneRange.Medium, ShootingContext.OutdoorNatural, true,
            5600, 2, 0.1, -5, -15, 20, -10, 15, 4, 7, -2, null, 30, 10, 200, 8);

        // Act
        var response = await client.PostAsJsonAsync("/api/presets", request);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task GetPresets_HttpEndpoint_ShouldReturn200()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/presets?skinTone=Light&context=StudioPortrait");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task PutPreset_HttpEndpoint_ByOwner_ShouldReturn200()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createRequest = new CreateEditingPresetRequest(
            "HTTP Update Target", null, SkinToneRange.Light, ShootingContext.Flash, false,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var createResponse = await client.PostAsJsonAsync("/api/presets", createRequest);
        createResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        var created = await createResponse.Content.ReadFromJsonAsync<EditingPresetDto>();

        // Act
        var updateRequest = new UpdateEditingPresetRequest(
            "HTTP Updated", "updated", SkinToneRange.Medium, ShootingContext.GoldenHour, true,
            6000, 5, 0.3, -10, -20, 25, -12, 18, 6, 10, -4, null, 35, 12, 210, 9);
        var response = await client.PutAsJsonAsync($"/api/presets/{created!.Id}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task DeletePreset_HttpEndpoint_ByOwner_ShouldReturn204()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createRequest = new CreateEditingPresetRequest(
            "HTTP Delete Target", null, SkinToneRange.Deep, ShootingContext.LowLight, false,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var createResponse = await client.PostAsJsonAsync("/api/presets", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<EditingPresetDto>();

        // Act
        var response = await client.DeleteAsync($"/api/presets/{created!.Id}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task FavoritePreset_HttpEndpoint_ShouldReturn200()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createRequest = new CreateEditingPresetRequest(
            "HTTP Fav Target", null, SkinToneRange.Light, ShootingContext.Flash, true,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var createResponse = await client.PostAsJsonAsync("/api/presets", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<EditingPresetDto>();

        // Act
        var response = await client.PostAsync($"/api/presets/{created!.Id}/favorite", null);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task UnfavoritePreset_HttpEndpoint_ShouldReturn200()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createRequest = new CreateEditingPresetRequest(
            "HTTP Unfav Target", null, SkinToneRange.Light, ShootingContext.Flash, true,
            5500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0);
        var createResponse = await client.PostAsJsonAsync("/api/presets", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<EditingPresetDto>();

        await client.PostAsync($"/api/presets/{created!.Id}/favorite", null);

        // Act
        var response = await client.DeleteAsync($"/api/presets/{created.Id}/favorite");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetFavorites_HttpEndpoint_ShouldReturn200()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/presets/favorites");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    #endregion

    #region Helpers

    private static EditingPreset CreateSeedPreset(string name, SkinToneRange skinTone, ShootingContext context, bool isPublic)
    {
        return new EditingPreset
        {
            Name = name,
            SkinToneRange = skinTone,
            ShootingContext = context,
            IsPublic = isPublic,
            IsSystemPreset = false,
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            Temperature = 5500,
            Tint = 0,
            Exposure = 0,
            Contrast = 0,
            Highlights = 0,
            Shadows = 0,
            Whites = 0,
            Blacks = 0,
            Clarity = 0,
            Vibrance = 0,
            Saturation = 0,
            HslAdjustments = "[]",
            SplitToneHighlightHue = 0,
            SplitToneHighlightSaturation = 0,
            SplitToneShadowHue = 0,
            SplitToneShadowSaturation = 0
        };
    }

    private static void SeedSystemPresets(IApplicationDbContext db)
    {
        var systemPresets = new List<EditingPreset>
        {
            // 1. Light Skin - Studio Portrait
            new()
            {
                Name = "Classic Light Studio",
                Description = "Clean studio portrait for light skin tones with neutral color balance",
                SkinToneRange = SkinToneRange.Light,
                ShootingContext = ShootingContext.StudioPortrait,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 5200,
                Tint = 3,
                Exposure = 0.15,
                Contrast = 5,
                Highlights = -20,
                Shadows = 10,
                Whites = -10,
                Blacks = 5,
                Clarity = 8,
                Vibrance = 5,
                Saturation = -3,
                HslAdjustments = """[{"Hue":-5,"Saturation":-10,"Luminance":5},{"Hue":5,"Saturation":-5,"Luminance":8},{"Hue":0,"Saturation":-8,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 40,
                SplitToneHighlightSaturation = 8,
                SplitToneShadowHue = 220,
                SplitToneShadowSaturation = 5
            },
            // 2. Light Skin - Outdoor Natural
            new()
            {
                Name = "Bright Outdoor Light",
                Description = "Fresh outdoor look for light skin with soft highlights",
                SkinToneRange = SkinToneRange.Light,
                ShootingContext = ShootingContext.OutdoorNatural,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 5400,
                Tint = 5,
                Exposure = 0.25,
                Contrast = -5,
                Highlights = -30,
                Shadows = 20,
                Whites = -20,
                Blacks = 10,
                Clarity = 3,
                Vibrance = 12,
                Saturation = -2,
                HslAdjustments = """[{"Hue":-3,"Saturation":-5,"Luminance":3},{"Hue":8,"Saturation":5,"Luminance":10},{"Hue":5,"Saturation":10,"Luminance":5},{"Hue":10,"Saturation":8,"Luminance":5},{"Hue":0,"Saturation":5,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 50,
                SplitToneHighlightSaturation = 12,
                SplitToneShadowHue = 210,
                SplitToneShadowSaturation = 8
            },
            // 3. Medium Skin - Golden Hour
            new()
            {
                Name = "Warm Golden Medium",
                Description = "Warm golden hour tones that complement medium skin beautifully",
                SkinToneRange = SkinToneRange.Medium,
                ShootingContext = ShootingContext.GoldenHour,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 6000,
                Tint = 6,
                Exposure = 0.2,
                Contrast = -8,
                Highlights = -20,
                Shadows = 25,
                Whites = -12,
                Blacks = 18,
                Clarity = 5,
                Vibrance = 8,
                Saturation = -4,
                HslAdjustments = """[{"Hue":-5,"Saturation":5,"Luminance":5},{"Hue":10,"Saturation":10,"Luminance":8},{"Hue":8,"Saturation":5,"Luminance":5},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":-5,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 42,
                SplitToneHighlightSaturation = 18,
                SplitToneShadowHue = 225,
                SplitToneShadowSaturation = 10
            },
            // 4. Medium Skin - Event Reception
            new()
            {
                Name = "Event Medium Balanced",
                Description = "Balanced indoor event lighting for medium skin tones",
                SkinToneRange = SkinToneRange.Medium,
                ShootingContext = ShootingContext.EventReception,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 4800,
                Tint = -2,
                Exposure = 0.35,
                Contrast = 10,
                Highlights = -35,
                Shadows = 30,
                Whites = -15,
                Blacks = 15,
                Clarity = 12,
                Vibrance = 6,
                Saturation = -6,
                HslAdjustments = """[{"Hue":-3,"Saturation":-8,"Luminance":3},{"Hue":5,"Saturation":-3,"Luminance":5},{"Hue":0,"Saturation":-10,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":5,"Saturation":-5,"Luminance":5},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":-5,"Saturation":-3,"Luminance":0}]""",
                SplitToneHighlightHue = 35,
                SplitToneHighlightSaturation = 10,
                SplitToneShadowHue = 240,
                SplitToneShadowSaturation = 8
            },
            // 5. Deep Skin - Golden Hour
            new()
            {
                Name = "Golden Hour Deep Skin",
                Description = "Rich warm tones that bring out the beautiful depth of deep skin in golden light",
                SkinToneRange = SkinToneRange.Deep,
                ShootingContext = ShootingContext.GoldenHour,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 6200,
                Tint = 8,
                Exposure = 0.3,
                Contrast = -10,
                Highlights = -25,
                Shadows = 30,
                Whites = -15,
                Blacks = 20,
                Clarity = 5,
                Vibrance = 10,
                Saturation = -5,
                HslAdjustments = """[{"Hue":-8,"Saturation":8,"Luminance":8},{"Hue":12,"Saturation":12,"Luminance":10},{"Hue":10,"Saturation":8,"Luminance":8},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":-8,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":-5,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 45,
                SplitToneHighlightSaturation = 20,
                SplitToneShadowHue = 230,
                SplitToneShadowSaturation = 15
            },
            // 6. Deep Skin - Studio Portrait
            new()
            {
                Name = "Studio Deep Glow",
                Description = "Studio preset emphasizing the natural glow and richness of deep skin",
                SkinToneRange = SkinToneRange.Deep,
                ShootingContext = ShootingContext.StudioPortrait,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 5600,
                Tint = 5,
                Exposure = 0.4,
                Contrast = 8,
                Highlights = -30,
                Shadows = 35,
                Whites = -18,
                Blacks = 25,
                Clarity = 10,
                Vibrance = 8,
                Saturation = -3,
                HslAdjustments = """[{"Hue":-5,"Saturation":5,"Luminance":10},{"Hue":8,"Saturation":8,"Luminance":12},{"Hue":5,"Saturation":3,"Luminance":5},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 38,
                SplitToneHighlightSaturation = 15,
                SplitToneShadowHue = 235,
                SplitToneShadowSaturation = 10
            },
            // 7. Very Deep Skin - Low Light
            new()
            {
                Name = "Luminous Dark Low Light",
                Description = "Carefully balanced low-light preset for very deep skin tones with enhanced shadow detail",
                SkinToneRange = SkinToneRange.VeryDeep,
                ShootingContext = ShootingContext.LowLight,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 5800,
                Tint = 10,
                Exposure = 0.6,
                Contrast = -15,
                Highlights = -15,
                Shadows = 45,
                Whites = -10,
                Blacks = 35,
                Clarity = 8,
                Vibrance = 12,
                Saturation = -2,
                HslAdjustments = """[{"Hue":-10,"Saturation":10,"Luminance":12},{"Hue":15,"Saturation":12,"Luminance":15},{"Hue":8,"Saturation":5,"Luminance":8},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":5,"Saturation":-10,"Luminance":5},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":-5,"Saturation":0,"Luminance":0}]""",
                SplitToneHighlightHue = 48,
                SplitToneHighlightSaturation = 22,
                SplitToneShadowHue = 225,
                SplitToneShadowSaturation = 12
            },
            // 8. Very Deep Skin - Flash
            new()
            {
                Name = "Flash Deep Correction",
                Description = "Corrects flash harshness on very deep skin with warming tones and recovered highlights",
                SkinToneRange = SkinToneRange.VeryDeep,
                ShootingContext = ShootingContext.Flash,
                IsPublic = true,
                IsSystemPreset = true,
                PhotographerId = null,
                Temperature = 5400,
                Tint = 12,
                Exposure = 0.5,
                Contrast = -12,
                Highlights = -45,
                Shadows = 40,
                Whites = -25,
                Blacks = 30,
                Clarity = 6,
                Vibrance = 10,
                Saturation = -8,
                HslAdjustments = """[{"Hue":-8,"Saturation":8,"Luminance":10},{"Hue":10,"Saturation":10,"Luminance":12},{"Hue":5,"Saturation":5,"Luminance":5},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":0,"Saturation":0,"Luminance":0},{"Hue":5,"Saturation":-8,"Luminance":5},{"Hue":0,"Saturation":-5,"Luminance":0},{"Hue":-5,"Saturation":-3,"Luminance":0}]""",
                SplitToneHighlightHue = 42,
                SplitToneHighlightSaturation = 18,
                SplitToneShadowHue = 230,
                SplitToneShadowSaturation = 14
            }
        };

        foreach (var preset in systemPresets)
        {
            // Avoid duplicates if called multiple times in the same test context
            if (!db.EditingPresets.Any(p => p.Name == preset.Name && p.IsSystemPreset))
            {
                db.EditingPresets.Add(preset);
            }
        }
    }

    #endregion
}
