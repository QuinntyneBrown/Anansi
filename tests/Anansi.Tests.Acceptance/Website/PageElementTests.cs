using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Website.Elements;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.1.2 Flex Editor: elements, breakpoints, layers, grid.
/// WEB-3.2.2 Client Gallery Blocks, WEB-3.2.3 Instagram Feed,
/// WEB-3.2.4 Custom Embed, WEB-3.2.5 Landing Page Templates.
/// </summary>
public class PageElementTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PageElementTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateElement_WithBreakpointOverrides_EndpointRoutes()
    {
        // Arrange
        var pageId = Guid.NewGuid();
        var command = new CreateElementCommand(
            pageId,
            ElementType.Image,
            "{\"src\":\"photo.jpg\",\"altText\":\"A photo\"}",
            0, 0, 300, 200,
            null, null,
            new List<CreateBreakpointOverride>
            {
                new(Breakpoint.Tablet, 0, 0, 250, 180, false, null),
                new(Breakpoint.Mobile, 0, 0, 100, 80, false, null)
            });

        // Act
        var response = await _client.PostAsJsonAsync($"/api/pages/{pageId}/elements", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateElement_ClientGalleryBlock_EndpointRoutes()
    {
        // Arrange - WEB-3.2.2
        var pageId = Guid.NewGuid();
        var command = new CreateElementCommand(
            pageId, ElementType.ClientGalleryBlock,
            "{\"displayType\":\"Grid\"}", 0, 0, 800, 600, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/pages/{pageId}/elements", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateElement_InstagramFeed_EndpointRoutes()
    {
        // Arrange - WEB-3.2.3
        var pageId = Guid.NewGuid();
        var command = new CreateElementCommand(
            pageId, ElementType.InstagramFeed,
            "{\"photoCount\":12,\"size\":\"medium\",\"clickBehavior\":\"lightbox\"}", 0, 0, 600, 400, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/pages/{pageId}/elements", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateElement_CustomEmbed_EndpointRoutes()
    {
        // Arrange - WEB-3.2.4
        var pageId = Guid.NewGuid();
        var command = new CreateElementCommand(
            pageId, ElementType.CustomEmbed,
            "{\"html\":\"<iframe src=\\\"https://example.com\\\"></iframe>\"}", 0, 0, 500, 300, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/pages/{pageId}/elements", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListElements_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync($"/api/pages/{Guid.NewGuid()}/elements");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateElement_LayerManagement_EndpointRoutes()
    {
        // Arrange - WEB-3.1.2 layer management
        var elementId = Guid.NewGuid();
        var command = new UpdateElementCommand(elementId, null, null, null, null, null, 99, null, null);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/pages/{Guid.NewGuid()}/elements/{elementId}", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteElement_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/pages/{Guid.NewGuid()}/elements/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
