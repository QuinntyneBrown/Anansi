using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Integrations;

public class IntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public IntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<(string token, Guid photographerId)> RegisterAndLogin()
    {
        var email = $"integ-{Guid.NewGuid():N}@example.com";
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "Password123!",
            firstName = "Test",
            lastName = "User",
            businessName = "Test Biz"
        });
        var body = await response.Content.ReadFromJsonAsync<RegisterDto>();
        return (body!.Token, body.PhotographerId);
    }

    [Fact]
    public async Task ConfigureGoogleAnalytics_WithValidMeasurementId_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/integrations/google-analytics", new
        {
            measurementId = "G-ABC1234567"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ConfigureFacebookPixel_WithValidPixelId_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/integrations/facebook-pixel", new
        {
            pixelId = "1234567890"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ConfigurePayPal_WithValidEmail_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/integrations/paypal", new
        {
            payPalEmail = "photographer@paypal.com"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ConfigureStripe_ReturnsStripeAccountId()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/integrations/stripe", new
        {
            email = "stripe@example.com",
            country = "CA"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("acct_test_");
    }

    [Fact]
    public async Task CreateWebhookSubscription_ReturnsCreated()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/webhooks", new
        {
            url = "https://example.com/webhook",
            eventType = (int)WebhookEventType.BookingCreated,
            secret = "my-secret"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetWebhookSubscriptions_ReturnsSubscriptions()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await authedClient.PostAsJsonAsync("/api/webhooks", new
        {
            url = "https://example.com/hook1",
            eventType = (int)WebhookEventType.PaymentReceived
        });

        // Act
        var response = await authedClient.GetAsync("/api/webhooks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("example.com/hook1");
    }

    [Fact]
    public async Task DeleteWebhookSubscription_ReturnsNoContent()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createResponse = await authedClient.PostAsJsonAsync("/api/webhooks", new
        {
            url = "https://example.com/hook-del",
            eventType = (int)WebhookEventType.ContractSigned
        });
        var createContent = await createResponse.Content.ReadFromJsonAsync<WebhookCreateResponseDto>();

        // Act
        var response = await authedClient.DeleteAsync($"/api/webhooks/{createContent!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task SaveCustomCodeInjection_ReturnsId()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/integrations/code-injection", new
        {
            code = "<script>console.log('hello');</script>",
            location = (int)CodeInjectionLocation.Header,
            label = "Test Script"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("id");
    }

    [Fact]
    public async Task GetCustomCodeInjections_ReturnsInjections()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await authedClient.PostAsJsonAsync("/api/integrations/code-injection", new
        {
            code = "<script>alert('hi');</script>",
            location = (int)CodeInjectionLocation.Footer,
            label = "Footer Script"
        });

        // Act
        var response = await authedClient.GetAsync("/api/integrations/code-injection");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Footer Script");
    }

    [Fact]
    public async Task CreateApiKey_ReturnsKeyOnce()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/api-keys", new
        {
            name = "My API Key"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("anansi_");
        content.Should().Contain("My API Key");
    }

    [Fact]
    public async Task RevokeApiKey_ReturnsNoContent()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createResponse = await authedClient.PostAsJsonAsync("/api/api-keys", new
        {
            name = "Revoke Test Key"
        });
        var body = await createResponse.Content.ReadFromJsonAsync<ApiKeyDto>();

        // Act
        var response = await authedClient.DeleteAsync($"/api/api-keys/{body!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task ConfigureGalleryAssist_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/integrations/gallery-assist", new
        {
            collectionId = Guid.NewGuid(),
            isEnabled = true,
            showFavoritingGuide = true,
            showDownloadGuide = false,
            showStoreGuide = true,
            showSharingGuide = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetLabPricing_ReturnsProducts()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.GetAsync("/api/labs/pricing/TestLab");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetAccountSettings_ReturnsSettings()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.GetAsync("/api/account/settings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Test Biz");
    }

    [Fact]
    public async Task UpdateAccountSettings_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/account/settings", new
        {
            firstName = "Updated",
            lastName = "Name",
            businessName = "New Business",
            phone = "555-0123"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetStorageUsage_ReturnsStorageInfo()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.GetAsync("/api/account/storage");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("usedBytes");
        content.Should().Contain("warningLevel");
    }

    [Fact]
    public async Task DeleteAccount_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.DeleteAsync("/api/account");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ConfigureInstagramFeed_ReturnsOk()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/integrations/instagram", new
        {
            accessToken = "test_token_123",
            numberOfPosts = 12,
            imageSize = "medium",
            clickBehavior = "lightbox"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private record RegisterDto(string UserId, Guid PhotographerId, string Token);
    private record WebhookCreateResponseDto(Guid Id);
    private record ApiKeyDto(Guid Id, string Name, string ApiKey, string KeyPrefix, DateTime? ExpiresAt);
}
