using System.Net;
using System.Net.Http.Json;
using Anansi.Application.DTOs.Website;
using Anansi.Domain.Entities.Website;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Website;

/// <summary>
/// WEB-3.1.1 Template Library: categories, preview, listing.
/// </summary>
public class WebsiteTemplateTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public WebsiteTemplateTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ListTemplates_ReturnsAllActiveTemplates()
    {
        // Arrange
        var db = _factory.CreateDbContext();
        db.WebsiteTemplates.AddRange(
            new WebsiteTemplate { Name = "Business Pro", Category = TemplateCategory.Business, IsActive = true, SortOrder = 1 },
            new WebsiteTemplate { Name = "Portfolio Clean", Category = TemplateCategory.Portfolio, IsActive = true, SortOrder = 2 },
            new WebsiteTemplate { Name = "Inactive", Category = TemplateCategory.OnePage, IsActive = false, SortOrder = 3 }
        );
        await db.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync("/api/WebsiteTemplates");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var templates = await response.Content.ReadFromJsonAsync<List<WebsiteTemplateDto>>();
        templates.Should().NotBeNull();
        templates!.Should().HaveCount(2);
        templates.Should().OnlyContain(t => t.IsActive);
    }

    [Fact]
    public async Task ListTemplates_FilterByCategory_ReturnsOnlyMatchingCategory()
    {
        // Arrange
        var db = _factory.CreateDbContext();
        db.WebsiteTemplates.AddRange(
            new WebsiteTemplate { Name = "Biz1", Category = TemplateCategory.Business, IsActive = true, SortOrder = 1 },
            new WebsiteTemplate { Name = "Port1", Category = TemplateCategory.Portfolio, IsActive = true, SortOrder = 2 }
        );
        await db.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync($"/api/WebsiteTemplates?category={TemplateCategory.Business}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var templates = await response.Content.ReadFromJsonAsync<List<WebsiteTemplateDto>>();
        templates!.Should().OnlyContain(t => t.Category == TemplateCategory.Business);
    }

    [Fact]
    public async Task GetTemplatePreview_ReturnsTemplateDetails()
    {
        // Arrange
        var db = _factory.CreateDbContext();
        var template = new WebsiteTemplate
        {
            Name = "Preview Test",
            Category = TemplateCategory.Portfolio,
            IsActive = true,
            PreviewImageUrl = "https://example.com/preview.jpg",
            SortOrder = 1
        };
        db.WebsiteTemplates.Add(template);
        await db.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync($"/api/WebsiteTemplates/{template.Id}/preview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await response.Content.ReadFromJsonAsync<WebsiteTemplateDto>();
        dto.Should().NotBeNull();
        dto!.Name.Should().Be("Preview Test");
        dto.PreviewImageUrl.Should().Be("https://example.com/preview.jpg");
    }

    [Fact]
    public async Task GetTemplatePreview_NonExistent_Returns404()
    {
        // Act
        var response = await _client.GetAsync($"/api/WebsiteTemplates/{Guid.NewGuid()}/preview");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
