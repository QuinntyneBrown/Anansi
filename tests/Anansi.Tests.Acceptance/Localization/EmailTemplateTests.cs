using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Anansi.Tests.Acceptance.Fixtures;

namespace Anansi.Tests.Acceptance.Localization;

public class EmailTemplateTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly IEmailTemplateRenderer _renderer;

    public EmailTemplateTests(TestWebApplicationFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        _renderer = scope.ServiceProvider.GetRequiredService<IEmailTemplateRenderer>();
    }

    [Theory]
    [InlineData(GalleryLanguage.English, "shared a gallery with you")]
    [InlineData(GalleryLanguage.French, "partagé une galerie avec vous")]
    [InlineData(GalleryLanguage.Spanish, "compartió una galería contigo")]
    [InlineData(GalleryLanguage.German, "hat eine Galerie mit Ihnen geteilt")]
    [InlineData(GalleryLanguage.Dutch, "heeft een galerij met u gedeeld")]
    [InlineData(GalleryLanguage.ChineseSimplified, "与您分享了一个相册")]
    [InlineData(GalleryLanguage.Portuguese, "compartilhou uma galeria com você")]
    [InlineData(GalleryLanguage.Swedish, "har delat ett galleri med dig")]
    public void GalleryShare_RendersInCorrectLanguage(GalleryLanguage language, string expectedSubjectFragment)
    {
        var variables = new Dictionary<string, string>
        {
            ["photographerName"] = "Jane Doe",
            ["collectionTitle"] = "Wedding Day",
            ["galleryUrl"] = "https://example.com/gallery/123",
        };

        var result = _renderer.Render("gallery-share", language, variables);

        result.Subject.Should().Contain("Jane Doe");
        result.Subject.Should().Contain(expectedSubjectFragment);
        result.HtmlBody.Should().Contain("Wedding Day");
        result.HtmlBody.Should().Contain("https://example.com/gallery/123");
    }

    [Fact]
    public void GalleryShare_InterpolatesVariables()
    {
        var variables = new Dictionary<string, string>
        {
            ["photographerName"] = "Test Photographer",
            ["collectionTitle"] = "Summer Portraits",
            ["galleryUrl"] = "https://example.com/gallery/456",
        };

        var result = _renderer.Render("gallery-share", GalleryLanguage.English, variables);

        result.Subject.Should().Contain("Test Photographer");
        result.HtmlBody.Should().Contain("Summer Portraits");
        result.HtmlBody.Should().Contain("https://example.com/gallery/456");
    }

    [Fact]
    public void DownloadReady_RendersInEnglish()
    {
        var variables = new Dictionary<string, string>
        {
            ["collectionTitle"] = "Engagement Photos",
            ["downloadUrl"] = "https://example.com/download/abc",
        };

        var result = _renderer.Render("download-ready", GalleryLanguage.English, variables);

        result.Subject.Should().Be("Your download is ready");
        result.HtmlBody.Should().Contain("Engagement Photos");
        result.HtmlBody.Should().Contain("https://example.com/download/abc");
        result.HtmlBody.Should().Contain("7 days");
    }

    [Fact]
    public void DownloadReady_RendersInFrench()
    {
        var variables = new Dictionary<string, string>
        {
            ["collectionTitle"] = "Photos de Mariage",
            ["downloadUrl"] = "https://example.com/download/xyz",
        };

        var result = _renderer.Render("download-ready", GalleryLanguage.French, variables);

        result.Subject.Should().Be("Votre téléchargement est prêt");
        result.HtmlBody.Should().Contain("Photos de Mariage");
        result.HtmlBody.Should().Contain("7 jours");
    }

    [Fact]
    public void BookingConfirmation_InterpolatesSessionType()
    {
        var variables = new Dictionary<string, string>
        {
            ["sessionType"] = "Portrait Session",
            ["date"] = "2026-04-15",
            ["time"] = "10:00 AM",
            ["location"] = "Studio A",
        };

        var result = _renderer.Render("booking-confirmation", GalleryLanguage.English, variables);

        result.Subject.Should().Contain("Portrait Session");
        result.HtmlBody.Should().Contain("Portrait Session");
        result.HtmlBody.Should().Contain("2026-04-15");
        result.HtmlBody.Should().Contain("Studio A");
    }

    [Fact]
    public void Invoice_RendersInSpanish()
    {
        var variables = new Dictionary<string, string>
        {
            ["invoiceNumber"] = "INV-001",
            ["businessName"] = "Foto Studio",
            ["amount"] = "$500.00",
            ["dueDate"] = "2026-05-01",
            ["invoiceUrl"] = "https://example.com/invoice/001",
        };

        var result = _renderer.Render("invoice", GalleryLanguage.Spanish, variables);

        result.Subject.Should().Contain("INV-001");
        result.Subject.Should().Contain("Foto Studio");
        result.HtmlBody.Should().Contain("$500.00");
        result.HtmlBody.Should().Contain("2026-05-01");
    }
}
