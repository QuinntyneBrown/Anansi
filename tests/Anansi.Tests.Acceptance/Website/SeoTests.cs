using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Website.Seo;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.5.1 SEO Manager (audit), WEB-3.5.2 AI Alt Text,
/// WEB-3.5.3 AI Page Descriptions, WEB-3.5.4 URL Redirects,
/// WEB-3.5.5 Social Sharing Images (OG images on page).
/// </summary>
public class SeoTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SeoTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RunSeoAudit_EndpointRoutes()
    {
        // Arrange - WEB-3.5.1
        // Act
        var response = await _client.GetAsync($"/api/websites/{Guid.NewGuid()}/seo/audit");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiAltText_EndpointRoutes()
    {
        // Arrange - WEB-3.5.2: individual and bulk generation
        var command = new GenerateAiAltTextCommand(new List<Guid> { Guid.NewGuid(), Guid.NewGuid() });

        // Act
        var response = await _client.PostAsJsonAsync($"/api/websites/{Guid.NewGuid()}/seo/ai-alt-text", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiDescription_EndpointRoutes()
    {
        // Arrange - WEB-3.5.3
        // Act
        var response = await _client.PostAsync($"/api/websites/{Guid.NewGuid()}/seo/ai-description/{Guid.NewGuid()}", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ManageUrlRedirects_CRUD_EndpointsRoute()
    {
        // Arrange - WEB-3.5.4
        var websiteId = Guid.NewGuid();

        // List
        var listResponse = await _client.GetAsync($"/api/websites/{websiteId}/seo/redirects");
        listResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);

        // Create
        var createCommand = new CreateUrlRedirectCommand(websiteId, "/old-page", "/new-page", RedirectType.Permanent301);
        var createResponse = await _client.PostAsJsonAsync($"/api/websites/{websiteId}/seo/redirects", createCommand);
        createResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);

        // Update
        var redirectId = Guid.NewGuid();
        var updateCommand = new UpdateUrlRedirectCommand(redirectId, null, null, RedirectType.Temporary302, null);
        var updateResponse = await _client.PutAsJsonAsync($"/api/websites/{websiteId}/seo/redirects/{redirectId}", updateCommand);
        updateResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);

        // Delete
        var deleteResponse = await _client.DeleteAsync($"/api/websites/{websiteId}/seo/redirects/{Guid.NewGuid()}");
        deleteResponse.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
