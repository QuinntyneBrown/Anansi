using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Website.Typography;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.4.1 Font System (1000+ fonts, custom upload WOFF/WOFF2/TTF/OTF),
/// WEB-3.4.2 Color System (40+ palettes, custom hex),
/// WEB-3.4.3 Animations (fade in, scale up, slide in, unfold).
/// </summary>
public class TypographyAndDesignTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TypographyAndDesignTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UploadCustomFont_EndpointRoutes()
    {
        // Arrange - WEB-3.4.1
        var command = new UploadCustomFontCommand(
            "Custom Sans", "https://fonts.example.com/custom-sans.woff2", "woff2", "400", "normal");

        // Act
        var response = await _client.PostAsJsonAsync("/api/website-typography/fonts", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListCustomFonts_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync("/api/website-typography/fonts");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteCustomFont_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/website-typography/fonts/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListColorPalettes_EndpointRoutes()
    {
        // Arrange - WEB-3.4.2
        // Act
        var response = await _client.GetAsync("/api/website-typography/color-palettes");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateCustomColorPalette_EndpointRoutes()
    {
        // Arrange - WEB-3.4.2: custom hex entry
        var command = new CreateCustomColorPaletteCommand("My Brand Colors", "[\"#FF5733\",\"#33FF57\",\"#3357FF\"]");

        // Act
        var response = await _client.PostAsJsonAsync("/api/website-typography/color-palettes", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }
}
