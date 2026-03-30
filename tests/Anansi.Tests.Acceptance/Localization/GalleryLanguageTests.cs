using System.Net;
using System.Net.Http.Json;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Localization;

public class GalleryLanguageTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public GalleryLanguageTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateCollection_WithLanguage_PersistsLanguage()
    {
        var request = new
        {
            title = "French Gallery",
            language = "French",
        };

        var response = await _client.PostAsJsonAsync("/api/collections", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<dynamic>();
        var id = body?.GetProperty("id").GetString();
        id.Should().NotBeNullOrEmpty();

        var getResponse = await _client.GetAsync($"/api/collections/{id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var collection = await getResponse.Content.ReadFromJsonAsync<dynamic>();
        var language = collection?.GetProperty("language").GetString();
        language.Should().Be("French");
    }

    [Fact]
    public async Task UpdateCollection_ChangeLanguage_UpdatesSuccessfully()
    {
        var createRequest = new { title = "Test Language Update" };
        var createResponse = await _client.PostAsJsonAsync("/api/collections", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<dynamic>();
        var id = created?.GetProperty("id").GetString();

        var updateRequest = new
        {
            title = "Test Language Update",
            language = "Spanish",
        };

        var updateResponse = await _client.PutAsJsonAsync($"/api/collections/{id}", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Theory]
    [InlineData("English")]
    [InlineData("Spanish")]
    [InlineData("French")]
    [InlineData("German")]
    [InlineData("Dutch")]
    [InlineData("ChineseSimplified")]
    [InlineData("Portuguese")]
    [InlineData("Swedish")]
    public async Task CreateCollection_AllLanguagesAccepted(string language)
    {
        var request = new
        {
            title = $"Gallery in {language}",
            language,
        };

        var response = await _client.PostAsJsonAsync("/api/collections", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreatePreset_WithLanguage_PersistsLanguage()
    {
        var request = new
        {
            name = "German Preset",
            language = "German",
        };

        var response = await _client.PostAsJsonAsync("/api/collection-presets", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
