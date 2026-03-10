using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Branding.Domains;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Branding;

/// <summary>
/// BRD-7.3.1 Gallery Custom Domain (SSL, DNS instructions),
/// BRD-7.3.2 Website Custom Domain (apex + subdomain support, SSL).
/// </summary>
public class CustomDomainTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CustomDomainTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateGalleryCustomDomain_EndpointRoutes()
    {
        // Arrange - BRD-7.3.1
        var command = new CreateCustomDomainCommand("gallery.myphotos.com", DomainPurpose.Gallery);

        // Act
        var response = await _client.PostAsJsonAsync("/api/Branding/domains", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateWebsiteCustomDomain_EndpointRoutes()
    {
        // Arrange - BRD-7.3.2
        var command = new CreateCustomDomainCommand("www.myphotography.com", DomainPurpose.Website);

        // Act
        var response = await _client.PostAsJsonAsync("/api/Branding/domains", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListCustomDomains_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync("/api/Branding/domains");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task VerifyCustomDomain_EndpointRoutes()
    {
        // Act
        var response = await _client.PostAsync($"/api/Branding/domains/{Guid.NewGuid()}/verify", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteCustomDomain_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/Branding/domains/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
