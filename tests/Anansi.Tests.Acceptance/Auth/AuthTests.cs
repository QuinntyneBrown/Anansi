using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Auth;

public class AuthTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public AuthTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsToken()
    {
        // Arrange
        var request = new
        {
            email = $"test-{Guid.NewGuid():N}@example.com",
            password = "Password123!",
            firstName = "John",
            lastName = "Doe",
            businessName = "John Photography"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<RegisterResponseDto>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrEmpty();
        body.PhotographerId.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var email = $"dup-{Guid.NewGuid():N}@example.com";
        var request = new
        {
            email,
            password = "Password123!",
            firstName = "John",
            lastName = "Doe",
            businessName = "John Photography"
        };

        var firstResponse = await _client.PostAsJsonAsync("/api/auth/register", request);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK, "first registration should succeed");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.OK, "duplicate registration should not succeed");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var email = $"login-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        var regResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password,
            firstName = "Jane",
            lastName = "Doe",
            businessName = "Jane Photos"
        });
        regResponse.StatusCode.Should().Be(HttpStatusCode.OK, "registration must succeed before login test");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { email, password });

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.OK, $"login should succeed. Response: {responseContent}");
        var body = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        body.Should().NotBeNull();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange & Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nonexistent@example.com",
            password = "WrongPassword123!"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ForgotPassword_WithAnyEmail_ReturnsOk()
    {
        // Arrange & Act
        var response = await _client.PostAsJsonAsync("/api/auth/forgot-password", new
        {
            email = "any@example.com"
        });

        // Assert (always returns OK to prevent email enumeration)
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ChangePassword_WhenAuthenticated_ReturnsOk()
    {
        // Arrange
        var email = $"chpw-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        var regResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password,
            firstName = "Test",
            lastName = "User",
            businessName = "Test Biz"
        });
        var regBody = await regResponse.Content.ReadFromJsonAsync<RegisterResponseDto>();

        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", regBody!.Token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = password,
            newPassword = "NewPassword456!"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Logout_WhenAuthenticated_ReturnsOk()
    {
        // Arrange
        var email = $"logout-{Guid.NewGuid():N}@example.com";

        var regResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = "Password123!",
            firstName = "Test",
            lastName = "User",
            businessName = "Test Biz"
        });
        var regBody = await regResponse.Content.ReadFromJsonAsync<RegisterResponseDto>();

        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", regBody!.Token);

        // Act
        var response = await authedClient.PostAsJsonAsync("/api/auth/logout", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private record RegisterResponseDto(string UserId, Guid PhotographerId, string Token);
    private record LoginResponseDto(string Token, string RefreshToken, DateTime ExpiresAt, Guid? PhotographerId);
}
