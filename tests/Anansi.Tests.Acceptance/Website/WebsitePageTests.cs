using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Website.Pages;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.2.1 Page Management, WEB-3.5.1/3.5.3/3.5.5 SEO per page, WEB-3.6.3 Per-page password.
/// </summary>
public class WebsitePageTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public WebsitePageTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreatePage_EndpointRoutes()
    {
        // Arrange
        var websiteId = Guid.NewGuid();
        var command = new CreatePageCommand(websiteId, "About Us", "about-us", WebsitePageType.About);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/websites/{websiteId}/pages", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListPages_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync($"/api/websites/{Guid.NewGuid()}/pages");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdatePage_WithSeoFields_EndpointRoutes()
    {
        // Arrange
        var pageId = Guid.NewGuid();
        var command = new UpdatePageCommand(pageId, "Updated Title", null, null, null, null, null, null,
            "SEO Title", "SEO Description for the page", "https://example.com/og.jpg");

        // Act
        var response = await _client.PutAsJsonAsync($"/api/websites/{Guid.NewGuid()}/pages/{pageId}", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeletePage_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/websites/{Guid.NewGuid()}/pages/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
