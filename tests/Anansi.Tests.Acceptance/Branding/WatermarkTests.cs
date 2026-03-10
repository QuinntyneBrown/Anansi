using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Branding.Watermarks;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Branding;

/// <summary>
/// BRD-7.2.1 Text Watermarks, BRD-7.2.2 Image Watermarks,
/// BRD-7.2.3 Per-Gallery Application.
/// </summary>
public class WatermarkTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public WatermarkTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateTextWatermark_EndpointRoutes()
    {
        // Arrange - BRD-7.2.1
        var command = new CreateWatermarkCommand(
            "My Text Watermark", WatermarkType.Text,
            "Copyright 2024", "Arial", null,
            0.5, 1.0, WatermarkPosition.BottomRight, true);

        // Act
        var response = await _client.PostAsJsonAsync("/api/Branding/watermarks", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateImageWatermark_EndpointRoutes()
    {
        // Arrange - BRD-7.2.2
        var command = new CreateWatermarkCommand(
            "Logo Watermark", WatermarkType.Image,
            null, null, "https://storage.example.com/watermark.png",
            0.3, 0.5, WatermarkPosition.Center, false);

        // Act
        var response = await _client.PostAsJsonAsync("/api/Branding/watermarks", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListWatermarks_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync("/api/Branding/watermarks");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateWatermark_OpacityAndPosition_EndpointRoutes()
    {
        // Arrange - BRD-7.2.1/7.2.2: opacity, scale, position configurable
        var id = Guid.NewGuid();
        var command = new UpdateWatermarkCommand(id, null, null, null, null, 0.8, 0.75, WatermarkPosition.TopLeft, null);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/Branding/watermarks/{id}", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteWatermark_EndpointRoutes()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/Branding/watermarks/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }
}
