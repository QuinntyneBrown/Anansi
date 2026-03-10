using System.Security.Claims;
using System.Text.Encodings.Web;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Anansi.Tests.Acceptance.Fixtures;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    public static readonly Guid TestPhotographerId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Jwt:Key", "TestOnlyKey_NotForProduction_MinLength32Chars!");
        builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");

        builder.ConfigureServices(services =>
        {
            // Replace auth with a test scheme that auto-authenticates
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "Test";
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
            })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });

            // Override ICurrentUserService with a test-specific one
            ReplaceServiceIfNotRegistered<ICurrentUserService, TestCurrentUserService>(services);
            // Remove ALL EF Core and DbContext registrations to cleanly switch to InMemory
            var dbName = $"AnansiTest_{Guid.NewGuid()}";
            var toRemove = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>)
                || d.ServiceType == typeof(DbContextOptions)
                || d.ServiceType == typeof(ApplicationDbContext)
                || d.ServiceType == typeof(IApplicationDbContext)
                || d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true
                || d.ImplementationType?.FullName?.Contains("Npgsql") == true
                || d.ServiceType.FullName?.Contains("Npgsql") == true
            ).ToList();
            foreach (var d in toRemove) services.Remove(d);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(dbName));
            services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

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

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        // Seed the test photographer and identity user so handlers that look up these records succeed
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();

        if (!db.Photographers.Any(p => p.Id == TestPhotographerId))
        {
            db.Photographers.Add(new Photographer
            {
                Id = TestPhotographerId,
                Email = "testuser@test.com",
                FirstName = "Test",
                LastName = "User",
                BusinessName = "Test Biz",
                Subdomain = "test-biz"
            });
            db.SaveChanges();
        }

        // Seed an Identity user so ChangePassword and other Identity-dependent handlers work
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var existingUser = userManager.FindByIdAsync(TestPhotographerId.ToString()).GetAwaiter().GetResult();
        if (existingUser == null)
        {
            var testUser = new ApplicationUser
            {
                Id = TestPhotographerId.ToString(),
                UserName = "testuser@test.com",
                Email = "testuser@test.com",
                NormalizedUserName = "TESTUSER@TEST.COM",
                NormalizedEmail = "TESTUSER@TEST.COM",
                EmailConfirmed = true,
                PhotographerId = TestPhotographerId
            };
            userManager.CreateAsync(testUser, "Password123!").GetAwaiter().GetResult();
        }

        return host;
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

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, TestWebApplicationFactory.TestPhotographerId.ToString()),
            new Claim(ClaimTypes.Name, "testuser@test.com"),
            new Claim(ClaimTypes.Email, "testuser@test.com"),
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

public class TestCurrentUserService : ICurrentUserService
{
    public Guid? PhotographerId => TestWebApplicationFactory.TestPhotographerId;
    public string? UserId => TestWebApplicationFactory.TestPhotographerId.ToString();
    public bool IsAuthenticated => true;
}

public class StubCdnService : ICdnService
{
    public Task<string> GetCdnUrlAsync(string storageKey, CancellationToken ct = default) => Task.FromResult($"https://cdn.test/{storageKey}");
    public Task<string> GenerateThumbnailAsync(string storageKey, int width, int height, CancellationToken ct = default) => Task.FromResult($"https://cdn.test/thumb/{storageKey}");
    public Task<ProgressiveImageSet> GenerateProgressiveImagesAsync(string storageKey, CancellationToken ct = default)
        => Task.FromResult(new ProgressiveImageSet { PlaceholderUrl = "https://cdn.test/p", LowResUrl = "https://cdn.test/l", FullResUrl = "https://cdn.test/f" });
    public Task InvalidateCacheAsync(string storageKey, CancellationToken ct = default) => Task.CompletedTask;
}
