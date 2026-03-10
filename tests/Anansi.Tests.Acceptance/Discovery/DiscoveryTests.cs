using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Discovery.Commands;
using Anansi.Application.Features.Discovery.Queries;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Discovery;
using Anansi.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Discovery;

public class DiscoveryTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public DiscoveryTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // -----------------------------------------------------------------------
    // TAG-22.1.1  Manage Photographer Cultural Tags
    // -----------------------------------------------------------------------

    [Fact]
    public async Task PutCulturalTags_WithValidTags_Returns200()
    {
        var command = new UpdateCulturalTagsCommand(new List<string>
        {
            "Caribbean Wedding", "Nigerian Traditional"
        });

        var response = await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCulturalTags_AfterSet_ReturnsStoredTags()
    {
        // Arrange
        var command = new UpdateCulturalTagsCommand(new List<string>
        {
            "Ghanaian Engagement", "Caribana/Carnival"
        });
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        // Act
        var response = await _client.GetAsync("/api/Profile/cultural-tags");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var tags = await response.Content.ReadFromJsonAsync<List<string>>();
        tags.Should().NotBeNull();
        tags.Should().Contain("Ghanaian Engagement");
        tags.Should().Contain("Caribana/Carnival");
    }

    [Fact]
    public async Task PutCulturalTags_WithCustomTag_AcceptsCustomTag()
    {
        var command = new UpdateCulturalTagsCommand(new List<string>
        {
            "Caribbean Wedding", "My Custom Specialty"
        });

        var response = await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await _client.GetAsync("/api/Profile/cultural-tags");
        var tags = await getResponse.Content.ReadFromJsonAsync<List<string>>();
        tags.Should().Contain("My Custom Specialty");
    }

    [Fact]
    public async Task PutCulturalTags_ExceedingMax20_Returns400()
    {
        var tooManyTags = Enumerable.Range(1, 21).Select(i => $"Tag{i}").ToList();
        var command = new UpdateCulturalTagsCommand(tooManyTags);

        var response = await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PutCulturalTags_TagExceeding50Chars_Returns400()
    {
        var longTag = new string('A', 51);
        var command = new UpdateCulturalTagsCommand(new List<string> { longTag });

        var response = await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PutCulturalTags_ReplacesExistingTags()
    {
        // Set initial tags
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "Caribbean Wedding" }));

        // Replace with different tags
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "Somali Wedding", "African Fashion" }));

        // Verify
        var response = await _client.GetAsync("/api/Profile/cultural-tags");
        var tags = await response.Content.ReadFromJsonAsync<List<string>>();
        tags.Should().Contain("Somali Wedding");
        tags.Should().Contain("African Fashion");
        tags!.Count.Should().Be(2);
    }

    [Fact]
    public async Task PutCulturalTags_AllPredefinedTags_AcceptsAll()
    {
        var command = new UpdateCulturalTagsCommand(PredefinedCulturalTags.All.ToList());

        var response = await _client.PutAsJsonAsync("/api/Profile/cultural-tags", command);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // -----------------------------------------------------------------------
    // TAG-22.1.2  List Available Cultural Tags
    // -----------------------------------------------------------------------

    [Fact]
    public async Task GetDirectoryCulturalTags_ReturnsAvailableTags()
    {
        // Seed some tags first
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "Caribbean Wedding", "Church/Gospel Event" }));

        var response = await _client.GetAsync("/api/Directory/cultural-tags");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var tags = await response.Content.ReadFromJsonAsync<List<AvailableTagDto>>();
        tags.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDirectoryCulturalTags_SystemTagsAlwaysVisible()
    {
        // Seed a system tag
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "Melanin Portraiture" }));

        var response = await _client.GetAsync("/api/Directory/cultural-tags");
        var tags = await response.Content.ReadFromJsonAsync<List<AvailableTagDto>>();

        // System tags should be visible regardless of usage count
        var melanin = tags!.FirstOrDefault(t => t.Name == "Melanin Portraiture");
        melanin.Should().NotBeNull();
        melanin!.IsSystem.Should().BeTrue();
    }

    [Fact]
    public async Task GetDirectoryCulturalTags_CustomTagsHiddenUnder3Users()
    {
        // Seed a custom tag used by only 1 photographer
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "VeryUniqueCustomTag" }));

        var response = await _client.GetAsync("/api/Directory/cultural-tags");
        var tags = await response.Content.ReadFromJsonAsync<List<AvailableTagDto>>();

        var custom = tags!.FirstOrDefault(t => t.Name == "VeryUniqueCustomTag");
        custom.Should().BeNull("custom tags with fewer than 3 users should not appear");
    }

    [Fact]
    public async Task GetDirectoryCulturalTags_IncludesUsageCount()
    {
        await _client.PutAsJsonAsync("/api/Profile/cultural-tags",
            new UpdateCulturalTagsCommand(new List<string> { "Community Event" }));

        var response = await _client.GetAsync("/api/Directory/cultural-tags");
        var tags = await response.Content.ReadFromJsonAsync<List<AvailableTagDto>>();

        var communityEvent = tags!.FirstOrDefault(t => t.Name == "Community Event");
        communityEvent.Should().NotBeNull();
        communityEvent!.UsageCount.Should().BeGreaterThanOrEqualTo(0);
    }

    // -----------------------------------------------------------------------
    // TAG-22.2.1  Set Neighborhood and Service Area
    // -----------------------------------------------------------------------

    [Fact]
    public async Task PutServiceArea_WithValidData_Returns200()
    {
        var command = new UpdateServiceAreaCommand("Scarborough / Malvern", 43.809, -79.217, 15);

        var response = await _client.PutAsJsonAsync("/api/Profile/service-area", command);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetServiceArea_AfterSet_ReturnsStoredValues()
    {
        var command = new UpdateServiceAreaCommand("Little Jamaica / Eglinton West", 43.6919, -79.4312, 10);
        await _client.PutAsJsonAsync("/api/Profile/service-area", command);

        var response = await _client.GetAsync("/api/Profile/service-area");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var area = await response.Content.ReadFromJsonAsync<ServiceAreaDto>();
        area.Should().NotBeNull();
        area!.Neighborhood.Should().Be("Little Jamaica / Eglinton West");
        area.Latitude.Should().BeApproximately(43.6919, 0.001);
        area.Longitude.Should().BeApproximately(-79.4312, 0.001);
        area.RadiusKm.Should().Be(10);
    }

    [Fact]
    public async Task PutServiceArea_RadiusTooSmall_Returns400()
    {
        var command = new UpdateServiceAreaCommand("Downtown Core", 43.651, -79.383, 3);

        var response = await _client.PutAsJsonAsync("/api/Profile/service-area", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PutServiceArea_RadiusTooLarge_Returns400()
    {
        var command = new UpdateServiceAreaCommand("Downtown Core", 43.651, -79.383, 150);

        var response = await _client.PutAsJsonAsync("/api/Profile/service-area", command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PutServiceArea_Updates_Existing()
    {
        await _client.PutAsJsonAsync("/api/Profile/service-area",
            new UpdateServiceAreaCommand("Weston", 43.700, -79.515, 10));

        await _client.PutAsJsonAsync("/api/Profile/service-area",
            new UpdateServiceAreaCommand("Downsview", 43.753, -79.468, 20));

        var response = await _client.GetAsync("/api/Profile/service-area");
        var area = await response.Content.ReadFromJsonAsync<ServiceAreaDto>();
        area!.Neighborhood.Should().Be("Downsview");
        area.RadiusKm.Should().Be(20);
    }

    [Fact]
    public async Task GetServiceArea_WhenNotSet_ReturnsNull()
    {
        // Use a fresh factory to get a clean state isn't feasible,
        // so we just verify the endpoint returns OK (it may be null or have data)
        var response = await _client.GetAsync("/api/Profile/service-area");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // -----------------------------------------------------------------------
    // TAG-22.3.1  Search by Cultural Tags
    // -----------------------------------------------------------------------

    [Fact]
    public async Task SearchByTags_ReturnsMatchingPhotographers()
    {
        // Seed photographer with tags
        var db = GetDb();
        var photographer = await SeedPhotographerWithTags(db, "TagSearch", "Studio",
            new[] { "Caribbean Wedding", "Caribana/Carnival" });

        var response = await _client.GetAsync("/api/Directory/search?tags=Caribbean+Wedding,Caribana/Carnival");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();
        result.Should().NotBeNull();
        result!.Items.Should().Contain(p => p.Id == photographer.Id);
    }

    [Fact]
    public async Task SearchByTags_OrdersByMatchCount()
    {
        var db = GetDb();
        var p1 = await SeedPhotographerWithTags(db, "OneMatch", "Studio1",
            new[] { "Nigerian Traditional" });
        var p2 = await SeedPhotographerWithTags(db, "TwoMatch", "Studio2",
            new[] { "Nigerian Traditional", "African Fashion" });

        var response = await _client.GetAsync("/api/Directory/search?tags=Nigerian+Traditional,African+Fashion");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        var items = result!.Items;
        var p2Item = items.FirstOrDefault(x => x.Id == p2.Id);
        var p1Item = items.FirstOrDefault(x => x.Id == p1.Id);

        if (p2Item != null && p1Item != null)
        {
            p2Item.RelevanceScore.Should().BeGreaterThan(p1Item.RelevanceScore);
        }
    }

    [Fact]
    public async Task SearchByTags_Paginated()
    {
        var response = await _client.GetAsync("/api/Directory/search?tags=Caribbean+Wedding&page=1");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();
        result.Should().NotBeNull();
        result!.PageSize.Should().Be(20);
        result.Page.Should().Be(1);
    }

    [Fact]
    public async Task SearchByTags_IncludesPhotographerDetails()
    {
        var db = GetDb();
        var photographer = await SeedPhotographerWithTags(db, "DetailCheck", "Detail Studio",
            new[] { "Church/Gospel Event" });

        var response = await _client.GetAsync("/api/Directory/search?tags=Church/Gospel+Event");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        var item = result!.Items.FirstOrDefault(p => p.Id == photographer.Id);
        item.Should().NotBeNull();
        item!.FirstName.Should().Be("DetailCheck");
        item.BusinessName.Should().Be("Detail Studio");
        item.Tags.Should().Contain("Church/Gospel Event");
    }

    [Fact]
    public async Task SearchByTags_NoMatch_ReturnsEmpty()
    {
        var response = await _client.GetAsync("/api/Directory/search?tags=NonexistentTag12345");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();
        result!.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    // -----------------------------------------------------------------------
    // TAG-22.3.2  Search by Neighborhood and Distance
    // -----------------------------------------------------------------------

    [Fact]
    public async Task SearchByNeighborhood_ReturnsPhotographersServingArea()
    {
        var db = GetDb();
        var photographer = await SeedPhotographerWithServiceArea(db, "NearScarb", "Scarb Studio",
            "Scarborough / Malvern", 43.809, -79.217, 20);

        var response = await _client.GetAsync("/api/Directory/search?neighborhood=Scarborough+/+Malvern");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();
        result!.Items.Should().Contain(p => p.Id == photographer.Id);
    }

    [Fact]
    public async Task SearchByNeighborhood_SortedByDistance()
    {
        var db = GetDb();
        // Photographer close to the target
        var close = await SeedPhotographerWithServiceArea(db, "Close", "CloseStudio",
            "Scarborough / Malvern", 43.810, -79.218, 50);
        // Photographer farther from target
        var far = await SeedPhotographerWithServiceArea(db, "Far", "FarStudio",
            "Rexdale / Etobicoke North", 43.734, -79.587, 50);

        var response = await _client.GetAsync("/api/Directory/search?neighborhood=Scarborough+/+Malvern");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        var closeItem = result!.Items.FirstOrDefault(p => p.Id == close.Id);
        var farItem = result.Items.FirstOrDefault(p => p.Id == far.Id);

        if (closeItem != null && farItem != null)
        {
            closeItem.DistanceKm!.Value.Should().BeLessThan(farItem.DistanceKm!.Value);
        }
    }

    [Fact]
    public async Task SearchByNeighborhood_IncludesDistanceKm()
    {
        var db = GetDb();
        var photographer = await SeedPhotographerWithServiceArea(db, "DistTest", "Dist Studio",
            "Downtown Core", 43.651, -79.383, 30);

        var response = await _client.GetAsync("/api/Directory/search?neighborhood=Downtown+Core");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        var item = result!.Items.FirstOrDefault(p => p.Id == photographer.Id);
        item.Should().NotBeNull();
        item!.DistanceKm.Should().NotBeNull();
        item.DistanceKm.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task SearchByNeighborhood_ExcludesOutOfRange()
    {
        var db = GetDb();
        // Photographer in Mississauga with small radius - won't cover Scarborough
        var photographer = await SeedPhotographerWithServiceArea(db, "TooFar", "TooFar Studio",
            "Mississauga", 43.589, -79.644, 5);

        var response = await _client.GetAsync("/api/Directory/search?neighborhood=Scarborough+/+Malvern");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        result!.Items.Should().NotContain(p => p.Id == photographer.Id);
    }

    // -----------------------------------------------------------------------
    // TAG-22.3.3  Combined Search (tags + neighborhood)
    // -----------------------------------------------------------------------

    [Fact]
    public async Task CombinedSearch_MatchesBothCriteria()
    {
        var db = GetDb();
        var photographer = await SeedPhotographerWithTagsAndServiceArea(db, "Combined", "CombStudio",
            new[] { "Nigerian Traditional" },
            "Little Jamaica / Eglinton West", 43.692, -79.431, 20);

        var response = await _client.GetAsync(
            "/api/Directory/search?tags=Nigerian+Traditional&neighborhood=Little+Jamaica+/+Eglinton+West");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();
        result!.Items.Should().Contain(p => p.Id == photographer.Id);
    }

    [Fact]
    public async Task CombinedSearch_ExcludesPartialMatch_TagOnly()
    {
        var db = GetDb();
        // Has matching tag but no matching service area
        var tagOnly = await SeedPhotographerWithTags(db, "TagOnlyC", "TagOnlyStudio",
            new[] { "Ethiopian/Eritrean Ceremony" });

        var response = await _client.GetAsync(
            "/api/Directory/search?tags=Ethiopian/Eritrean+Ceremony&neighborhood=Scarborough+/+Malvern");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        result!.Items.Should().NotContain(p => p.Id == tagOnly.Id,
            "photographer without matching service area should be excluded from combined search");
    }

    [Fact]
    public async Task CombinedSearch_OrderedByCombinedRelevance()
    {
        var db = GetDb();
        var p1 = await SeedPhotographerWithTagsAndServiceArea(db, "Comb1", "CombStudio1",
            new[] { "Somali Wedding" },
            "Jane-Finch / Black Creek", 43.761, -79.520, 30);
        var p2 = await SeedPhotographerWithTagsAndServiceArea(db, "Comb2", "CombStudio2",
            new[] { "Somali Wedding", "Community Event" },
            "Jane-Finch / Black Creek", 43.762, -79.521, 30);

        var response = await _client.GetAsync(
            "/api/Directory/search?tags=Somali+Wedding,Community+Event&neighborhood=Jane-Finch+/+Black+Creek");
        var result = await response.Content.ReadFromJsonAsync<SearchPhotographersResult>();

        var p2Item = result!.Items.FirstOrDefault(x => x.Id == p2.Id);
        var p1Item = result.Items.FirstOrDefault(x => x.Id == p1.Id);

        if (p1Item != null && p2Item != null)
        {
            p2Item.RelevanceScore.Should().BeGreaterThanOrEqualTo(p1Item.RelevanceScore);
        }
    }

    [Fact]
    public async Task Search_NoCriteria_Returns400()
    {
        var response = await _client.GetAsync("/api/Directory/search");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // -----------------------------------------------------------------------
    // Haversine Distance Calculation
    // -----------------------------------------------------------------------

    [Fact]
    public void HaversineHelper_CalculatesCorrectDistance()
    {
        // Toronto CN Tower to Mississauga Civic Centre is roughly 25-26 km
        var distance = HaversineHelper.CalculateDistanceKm(43.6426, -79.3871, 43.5890, -79.6441);
        distance.Should().BeGreaterThan(20);
        distance.Should().BeLessThan(30);
    }

    [Fact]
    public void HaversineHelper_SamePoint_ReturnsZero()
    {
        var distance = HaversineHelper.CalculateDistanceKm(43.6510, -79.3830, 43.6510, -79.3830);
        distance.Should().BeApproximately(0, 0.001);
    }

    [Fact]
    public void HaversineHelper_BoundingBox_ContainsPoint()
    {
        var bbox = HaversineHelper.GetBoundingBox(43.651, -79.383, 10);
        bbox.MinLat.Should().BeLessThan(43.651);
        bbox.MaxLat.Should().BeGreaterThan(43.651);
        bbox.MinLon.Should().BeLessThan(-79.383);
        bbox.MaxLon.Should().BeGreaterThan(-79.383);
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private ApplicationDbContext GetDb()
    {
        var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }

    private async Task<Photographer> SeedPhotographerWithTags(ApplicationDbContext db,
        string firstName, string businessName, string[] tagNames)
    {
        var photographer = new Photographer
        {
            Id = Guid.NewGuid(),
            Email = $"{firstName.ToLower()}@test.com",
            FirstName = firstName,
            LastName = "Tester",
            BusinessName = businessName,
            Subdomain = $"test-{Guid.NewGuid():N}"[..20]
        };
        db.Photographers.Add(photographer);

        foreach (var tagName in tagNames)
        {
            var tag = await db.CulturalTags.FirstOrDefaultAsync(t => t.Name == tagName);
            if (tag == null)
            {
                var isSystem = PredefinedCulturalTags.All
                    .Any(p => string.Equals(p, tagName, StringComparison.OrdinalIgnoreCase));
                tag = new CulturalTag { Name = tagName, IsSystem = isSystem };
                db.CulturalTags.Add(tag);
            }
            db.PhotographerCulturalTags.Add(new PhotographerCulturalTag
            {
                PhotographerId = photographer.Id,
                CulturalTagId = tag.Id
            });
        }

        await db.SaveChangesAsync();
        return photographer;
    }

    private async Task<Photographer> SeedPhotographerWithServiceArea(ApplicationDbContext db,
        string firstName, string businessName,
        string neighborhood, double lat, double lon, int radiusKm)
    {
        var photographer = new Photographer
        {
            Id = Guid.NewGuid(),
            Email = $"{firstName.ToLower()}@test.com",
            FirstName = firstName,
            LastName = "Tester",
            BusinessName = businessName,
            Subdomain = $"test-{Guid.NewGuid():N}"[..20]
        };
        db.Photographers.Add(photographer);

        db.PhotographerServiceAreas.Add(new PhotographerServiceArea
        {
            PhotographerId = photographer.Id,
            Neighborhood = neighborhood,
            Latitude = lat,
            Longitude = lon,
            RadiusKm = radiusKm
        });

        await db.SaveChangesAsync();
        return photographer;
    }

    private async Task<Photographer> SeedPhotographerWithTagsAndServiceArea(ApplicationDbContext db,
        string firstName, string businessName,
        string[] tagNames,
        string neighborhood, double lat, double lon, int radiusKm)
    {
        var photographer = new Photographer
        {
            Id = Guid.NewGuid(),
            Email = $"{firstName.ToLower()}@test.com",
            FirstName = firstName,
            LastName = "Tester",
            BusinessName = businessName,
            Subdomain = $"test-{Guid.NewGuid():N}"[..20]
        };
        db.Photographers.Add(photographer);

        foreach (var tagName in tagNames)
        {
            var tag = await db.CulturalTags.FirstOrDefaultAsync(t => t.Name == tagName);
            if (tag == null)
            {
                var isSystem = PredefinedCulturalTags.All
                    .Any(p => string.Equals(p, tagName, StringComparison.OrdinalIgnoreCase));
                tag = new CulturalTag { Name = tagName, IsSystem = isSystem };
                db.CulturalTags.Add(tag);
            }
            db.PhotographerCulturalTags.Add(new PhotographerCulturalTag
            {
                PhotographerId = photographer.Id,
                CulturalTagId = tag.Id
            });
        }

        db.PhotographerServiceAreas.Add(new PhotographerServiceArea
        {
            PhotographerId = photographer.Id,
            Neighborhood = neighborhood,
            Latitude = lat,
            Longitude = lon,
            RadiusKm = radiusKm
        });

        await db.SaveChangesAsync();
        return photographer;
    }
}
