using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Branding.Identity;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Branding;

/// <summary>
/// BRD-7.1.1 Profile Icon, BRD-7.1.2 Logo Upload,
/// BRD-7.1.3 Collection Cover Logo, BRD-7.1.4 Custom Favicon,
/// BRD-7.1.5 Platform Branding Removal.
/// </summary>
public class BrandingIdentityTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BrandingIdentityTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetBrandingProfile_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync("/api/Branding/profile");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateBrandingProfile_WithLogo_EndpointRoutes()
    {
        // Arrange - BRD-7.1.2: logo upload (PNG, up to 5MB)
        var command = new UpdateBrandingProfileCommand(
            "https://storage.example.com/icons/profile.png",
            "https://storage.example.com/logos/mylogo.png",
            "https://storage.example.com/favicons/icon.ico",
            "#FF5733",
            "Elegant Serif");

        // Act
        var response = await _client.PutAsJsonAsync("/api/Branding/profile", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateBrandingProfile_WithFavicon_EndpointRoutes()
    {
        // Arrange - BRD-7.1.4: custom favicon
        var command = new UpdateBrandingProfileCommand(null, null, "https://storage.example.com/favicons/custom.ico", null, null);

        // Act
        var response = await _client.PutAsJsonAsync("/api/Branding/profile", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }
}
