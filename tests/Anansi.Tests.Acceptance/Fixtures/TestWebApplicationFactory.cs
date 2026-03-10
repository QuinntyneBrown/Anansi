using Anansi.Application.Interfaces;
using Anansi.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Fixtures;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all DbContext-related registrations to avoid dual-provider error
            var descriptorsToRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>)
                    || d.ServiceType == typeof(DbContextOptions)
                    || (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
                    || d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true)
                .ToList();
            foreach (var d in descriptorsToRemove) services.Remove(d);

            // Also remove the ApplicationDbContext registration itself so we can re-add it cleanly
            var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ApplicationDbContext));
            if (dbContextDescriptor != null) services.Remove(dbContextDescriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase($"AnansiTest_{Guid.NewGuid()}"));

            // Register stub services for interfaces without real implementations
            ReplaceServiceIfNotRegistered<IEmailService, StubEmailService>(services);
            ReplaceServiceIfNotRegistered<IPaymentService, StubPaymentService>(services);
            ReplaceServiceIfNotRegistered<IStorageService, StubStorageService>(services);
            ReplaceServiceIfNotRegistered<IPushNotificationService, StubPushNotificationService>(services);
            ReplaceServiceIfNotRegistered<IInstagramService, StubInstagramService>(services);
            ReplaceServiceIfNotRegistered<ILabIntegrationService, StubLabIntegrationService>(services);
            ReplaceServiceIfNotRegistered<IWebhookService, StubWebhookService>(services);
            ReplaceServiceIfNotRegistered<IGoogleCalendarService, StubGoogleCalendarService>(services);
            ReplaceServiceIfNotRegistered<IVideoCallService, StubVideoCallService>(services);
            ReplaceServiceIfNotRegistered<IPayPalService, StubPayPalService>(services);
            ReplaceServiceIfNotRegistered<ILightroomSyncService, StubLightroomSyncService>(services);
            ReplaceServiceIfNotRegistered<ICdnService, StubCdnService>(services);
        });

        builder.UseEnvironment("Testing");
    }

    private static void ReplaceServiceIfNotRegistered<TInterface, TImpl>(IServiceCollection services)
        where TInterface : class
        where TImpl : class, TInterface
    {
        var existing = services.FirstOrDefault(d => d.ServiceType == typeof(TInterface));
        if (existing != null) services.Remove(existing);
        services.AddScoped<TInterface, TImpl>();
    }

    public ApplicationDbContext CreateDbContext()
    {
        var scope = Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    }
}

// Stub implementations for testing
public class StubEmailService : IEmailService
{
    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default) => Task.CompletedTask;
    public Task SendTemplatedAsync(string to, string templateId, Dictionary<string, string> variables, CancellationToken ct = default) => Task.CompletedTask;
}

public class StubPaymentService : IPaymentService
{
    public Task<string> CreatePaymentIntentAsync(long amountCents, string currency, string stripeAccountId, Dictionary<string, string>? metadata = null, CancellationToken ct = default) => Task.FromResult("pi_test");
    public Task<string> CreateCheckoutSessionAsync(string stripeAccountId, IEnumerable<(string name, long unitAmountCents, int qty)> lineItems, string successUrl, string cancelUrl, CancellationToken ct = default) => Task.FromResult("cs_test");
    public Task RefundAsync(string paymentIntentId, long? amountCents = null, CancellationToken ct = default) => Task.CompletedTask;
    public Task<string> CreateConnectedAccountAsync(string email, string country, CancellationToken ct = default) => Task.FromResult("acct_test_" + Guid.NewGuid().ToString()[..8]);
}

public class StubStorageService : IStorageService
{
    public Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default) => Task.FromResult("key_" + fileName);
    public Task<Stream> DownloadAsync(string key, CancellationToken ct = default) => Task.FromResult<Stream>(new MemoryStream());
    public Task DeleteAsync(string key, CancellationToken ct = default) => Task.CompletedTask;
    public Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry, CancellationToken ct = default) => Task.FromResult($"https://storage.test/{key}");
}

public class StubPushNotificationService : IPushNotificationService
{
    public Task SendAsync(string userId, string title, string message, string? link = null, CancellationToken ct = default) => Task.CompletedTask;
    public Task RegisterDeviceTokenAsync(string userId, string deviceToken, string platform, CancellationToken ct = default) => Task.CompletedTask;
    public Task UnregisterDeviceTokenAsync(string userId, string deviceToken, CancellationToken ct = default) => Task.CompletedTask;
}

public class StubInstagramService : IInstagramService
{
    public Task<IReadOnlyList<InstagramPost>> GetFeedAsync(string accessToken, int count, CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<InstagramPost>>(new List<InstagramPost>
        {
            new() { Id = "1", MediaUrl = "https://instagram.test/1.jpg", Permalink = "https://instagram.com/p/1", MediaType = "IMAGE", Timestamp = DateTime.UtcNow }
        });
}

public class StubLabIntegrationService : ILabIntegrationService
{
    public Task<string> SubmitOrderAsync(LabOrderRequest request, CancellationToken ct = default) => Task.FromResult("lab_order_" + Guid.NewGuid().ToString()[..8]);
    public Task<LabOrderStatusResult> GetOrderStatusAsync(string labName, string externalOrderId, CancellationToken ct = default) => Task.FromResult(new LabOrderStatusResult { Status = "InProduction" });
    public Task<IReadOnlyList<LabPricingResult>> GetPricingAsync(string labName, CancellationToken ct = default) => Task.FromResult<IReadOnlyList<LabPricingResult>>(new List<LabPricingResult>());
}

public class StubWebhookService : IWebhookService
{
    public Task DeliverAsync(Guid photographerId, Domain.Enums.WebhookEventType eventType, object payload, CancellationToken ct = default) => Task.CompletedTask;
}

public class StubGoogleCalendarService : IGoogleCalendarService
{
    public Task<string> CreateEventAsync(string calendarId, string title, DateTime start, DateTime end, string? attendeeEmail = null, CancellationToken ct = default) => Task.FromResult("event_test");
    public Task UpdateEventAsync(string calendarId, string eventId, string title, DateTime start, DateTime end, CancellationToken ct = default) => Task.CompletedTask;
    public Task DeleteEventAsync(string calendarId, string eventId, CancellationToken ct = default) => Task.CompletedTask;
    public Task<IReadOnlyList<CalendarEventDto>> GetEventsAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default) => Task.FromResult<IReadOnlyList<CalendarEventDto>>(new List<CalendarEventDto>());
    public Task<IReadOnlyList<CalendarEventDto>> GetBusyTimesAsync(string calendarId, DateTime from, DateTime to, CancellationToken ct = default) => Task.FromResult<IReadOnlyList<CalendarEventDto>>(new List<CalendarEventDto>());
}

public class StubVideoCallService : IVideoCallService
{
    public Task<VideoMeetingLink> CreateZoomMeetingAsync(string zoomAccountId, string topic, DateTime startTime, int durationMinutes, CancellationToken ct = default)
        => Task.FromResult(new VideoMeetingLink { MeetingUrl = "https://zoom.us/j/test", Provider = "Zoom" });
    public Task<VideoMeetingLink> CreateGoogleMeetAsync(string calendarId, string topic, DateTime startTime, int durationMinutes, string? attendeeEmail = null, CancellationToken ct = default)
        => Task.FromResult(new VideoMeetingLink { MeetingUrl = "https://meet.google.com/test", Provider = "GoogleMeet" });
}

public class StubPayPalService : IPayPalService
{
    public Task<string> CreateOrderAsync(string paypalEmail, long amountCents, string currency, string description, string returnUrl, string cancelUrl, CancellationToken ct = default) => Task.FromResult("paypal_order_test");
    public Task<PayPalCaptureResult> CaptureOrderAsync(string orderId, CancellationToken ct = default) => Task.FromResult(new PayPalCaptureResult { CaptureId = "capture_test", Status = "COMPLETED", IsSuccess = true });
    public Task RefundAsync(string captureId, long? amountCents = null, CancellationToken ct = default) => Task.CompletedTask;
}

public class StubLightroomSyncService : ILightroomSyncService
{
    public Task<LightroomPublishResult> PublishCollectionAsync(Guid photographerId, string lightroomCollectionId, IEnumerable<LightroomImage> images, CancellationToken ct = default)
        => Task.FromResult(new LightroomPublishResult { ImagesUploaded = 1 });
    public Task<LightroomSyncResult> SyncStructureAsync(Guid photographerId, IEnumerable<LightroomCollectionInfo> collections, CancellationToken ct = default)
        => Task.FromResult(new LightroomSyncResult { CollectionsSynced = 1 });
    public Task<IReadOnlyList<LightroomFavoriteList>> GetFavoriteListsAsync(Guid photographerId, Guid collectionId, CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<LightroomFavoriteList>>(new List<LightroomFavoriteList>());
}

public class StubCdnService : ICdnService
{
    public Task<string> GetCdnUrlAsync(string storageKey, CancellationToken ct = default) => Task.FromResult($"https://cdn.test/{storageKey}");
    public Task<string> GenerateThumbnailAsync(string storageKey, int width, int height, CancellationToken ct = default) => Task.FromResult($"https://cdn.test/thumb/{storageKey}");
    public Task<ProgressiveImageSet> GenerateProgressiveImagesAsync(string storageKey, CancellationToken ct = default)
        => Task.FromResult(new ProgressiveImageSet { PlaceholderUrl = "https://cdn.test/p", LowResUrl = "https://cdn.test/l", FullResUrl = "https://cdn.test/f" });
    public Task InvalidateCacheAsync(string storageKey, CancellationToken ct = default) => Task.CompletedTask;
}
