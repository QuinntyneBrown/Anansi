using System.Net;
using System.Net.Http.Json;
using Anansi.Application.Features.Branding.Documents;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Branding;

/// <summary>
/// BRD-7.4.1 Document Branding (logo, brand colors, header images per document type),
/// BRD-7.4.2 Font Theme (consistent font for branded documents and emails).
/// </summary>
public class DocumentBrandingTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DocumentBrandingTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UpsertDocumentBranding_Contract_EndpointRoutes()
    {
        // Arrange - BRD-7.4.1
        var command = new UpsertDocumentBrandingCommand(
            DocumentType.Contract,
            "https://storage.example.com/headers/contract.jpg",
            "#333333",
            "#666666",
            "Modern Sans");

        // Act
        var response = await _client.PutAsJsonAsync("/api/Branding/documents", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpsertDocumentBranding_Invoice_WithFontTheme_EndpointRoutes()
    {
        // Arrange - BRD-7.4.2: font theme for branded documents
        var command = new UpsertDocumentBrandingCommand(
            DocumentType.Invoice, null, "#FF5733", null, "Elegant Serif");

        // Act
        var response = await _client.PutAsJsonAsync("/api/Branding/documents", command);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetDocumentBranding_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync($"/api/Branding/documents/{DocumentType.Contract}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ListDocumentBrandings_EndpointRoutes()
    {
        // Act
        var response = await _client.GetAsync("/api/Branding/documents");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }
}
