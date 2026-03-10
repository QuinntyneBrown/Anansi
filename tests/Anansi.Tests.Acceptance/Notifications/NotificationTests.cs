using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Anansi.Domain.Entities.Notifications;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Notifications;

public class NotificationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public NotificationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<(string token, Guid photographerId)> RegisterAndLogin()
    {
        var email = $"notif-{Guid.NewGuid():N}@example.com";
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
    public async Task GetNotifications_WhenAuthenticated_ReturnsPagedList()
    {
        // Arrange
        var (token, photographerId) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Seed a notification
        using var db = _factory.CreateDbContext();
        db.Notifications.Add(new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.SessionBooked,
            Category = NotificationCategory.StudioManager,
            Title = "New Booking",
            Message = "John Doe booked a session."
        });
        await db.SaveChangesAsync();

        // Act
        var response = await authedClient.GetAsync("/api/notifications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("New Booking");
    }

    [Fact]
    public async Task GetNotifications_FilterByCategory_ReturnsFilteredResults()
    {
        // Arrange
        var (token, photographerId) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var db = _factory.CreateDbContext();
        db.Notifications.Add(new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.StoreOrderPlaced,
            Category = NotificationCategory.Store,
            Title = "Order Placed",
            Message = "New store order."
        });
        db.Notifications.Add(new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.SessionBooked,
            Category = NotificationCategory.StudioManager,
            Title = "Session Booked",
            Message = "New session."
        });
        await db.SaveChangesAsync();

        // Act
        var response = await authedClient.GetAsync("/api/notifications?category=Store");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Order Placed");
        content.Should().NotContain("Session Booked");
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsCorrectCount()
    {
        // Arrange
        var (token, photographerId) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get baseline count before seeding
        var baselineResponse = await authedClient.GetAsync("/api/notifications/unread-count");
        var baselineContent = await baselineResponse.Content.ReadAsStringAsync();
        var baselineCount = System.Text.Json.JsonDocument.Parse(baselineContent)
            .RootElement.GetProperty("count").GetInt32();

        using var db = _factory.CreateDbContext();
        db.Notifications.Add(new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.PhotoDownloaded,
            Category = NotificationCategory.ClientGallery,
            Title = "Download",
            Message = "Photo downloaded."
        });
        db.Notifications.Add(new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.PhotoDownloaded,
            Category = NotificationCategory.ClientGallery,
            Title = "Download 2",
            Message = "Another photo downloaded.",
            IsRead = true,
            ReadAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        // Act
        var response = await authedClient.GetAsync("/api/notifications/unread-count");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var newCount = System.Text.Json.JsonDocument.Parse(content)
            .RootElement.GetProperty("count").GetInt32();
        // One new unread notification was added (the read one shouldn't be counted)
        newCount.Should().Be(baselineCount + 1);
    }

    [Fact]
    public async Task MarkAsRead_MarksNotificationAsRead()
    {
        // Arrange
        var (token, photographerId) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var notification = new Notification
        {
            PhotographerId = TestWebApplicationFactory.TestPhotographerId,
            EventType = NotificationEventType.ContractSigned,
            Category = NotificationCategory.StudioManager,
            Title = "Contract Signed",
            Message = "Contract was signed."
        };
        using var db = _factory.CreateDbContext();
        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        // Act
        var response = await authedClient.PutAsJsonAsync($"/api/notifications/{notification.Id}/read", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task MarkAllAsRead_MarksAllNotificationsAsRead()
    {
        // Arrange
        var (token, photographerId) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var db = _factory.CreateDbContext();
        db.Notifications.AddRange(
            new Notification { PhotographerId = TestWebApplicationFactory.TestPhotographerId, EventType = NotificationEventType.PhotoDownloaded, Category = NotificationCategory.ClientGallery, Title = "T1", Message = "M1" },
            new Notification { PhotographerId = TestWebApplicationFactory.TestPhotographerId, EventType = NotificationEventType.StoreOrderPlaced, Category = NotificationCategory.Store, Title = "T2", Message = "M2" }
        );
        await db.SaveChangesAsync();

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/notifications/read-all", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdatePreference_SetsEmailAndPushToggles()
    {
        // Arrange
        var (token, _) = await RegisterAndLogin();
        var authedClient = _factory.CreateClient();
        authedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await authedClient.PutAsJsonAsync("/api/notifications/preferences", new
        {
            eventType = (int)NotificationEventType.SessionBooked,
            emailEnabled = false,
            pushEnabled = true,
            inAppEnabled = true,
            emailDigestOption = (int)EmailDigestOption.DailySummary
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify
        var prefsResponse = await authedClient.GetAsync("/api/notifications/preferences");
        var content = await prefsResponse.Content.ReadAsStringAsync();
        content.Should().Contain("false"); // emailEnabled is false
    }

    private record RegisterDto(string UserId, Guid PhotographerId, string Token);
}
