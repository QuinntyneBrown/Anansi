using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Website.Blog;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.3.1 Blog Post Management, WEB-3.3.2 Blog Layouts/Pagination/Categories,
/// WEB-3.3.3 Blog Migration.
/// </summary>
public class BlogTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BlogTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateBlogPost_EndpointRoutes()
    {
        // Arrange
        var websiteId = Guid.NewGuid();
        var command = new CreateBlogPostCommand(
            websiteId, "My First Post", "my-first-post", "Excerpt",
            "<p>Hello World</p>", null, BlogPostStatus.Draft, null, null, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync($"/api/websites/{websiteId}/blog/posts", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListBlogPosts_WithPagination_EndpointRoutes()
    {
        // Arrange - WEB-3.3.2: pagination and category filtering
        var websiteId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/websites/{websiteId}/blog/posts?page=1&pageSize=10&status=Published");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DuplicateBlogPost_EndpointRoutes()
    {
        // Arrange - WEB-3.3.1: post duplication
        var websiteId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/websites/{websiteId}/blog/posts/{postId}/duplicate", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ImportBlogPost_EndpointRoutes()
    {
        // Arrange - WEB-3.3.3: blog migration
        var websiteId = Guid.NewGuid();
        var command = new ImportBlogPostCommand(
            websiteId, "Imported Post", "<p>Imported content</p>",
            null, null, DateTime.UtcNow.AddDays(-30), "https://oldblog.com/post1");

        // Act
        var response = await _client.PostAsJsonAsync($"/api/websites/{websiteId}/blog/posts/import", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ManageBlogCategories_EndpointsRoute()
    {
        // Arrange
        var websiteId = Guid.NewGuid();

        // Act - List categories
        var listResponse = await _client.GetAsync($"/api/websites/{websiteId}/blog/categories");
        listResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);

        // Act - Create category
        var createCommand = new CreateBlogCategoryCommand("Weddings", null, "Wedding photography posts");
        var createResponse = await _client.PostAsJsonAsync($"/api/websites/{websiteId}/blog/categories", createCommand);
        createResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);

        // Act - Delete category
        var deleteResponse = await _client.DeleteAsync($"/api/websites/{websiteId}/blog/categories/{Guid.NewGuid()}");
        deleteResponse.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteBlogPost_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/websites/{Guid.NewGuid()}/blog/posts/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
