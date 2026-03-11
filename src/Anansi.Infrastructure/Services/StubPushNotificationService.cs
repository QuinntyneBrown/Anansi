using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubPushNotificationService : IPushNotificationService
{
    private readonly ILogger<StubPushNotificationService> _logger;

    public StubPushNotificationService(ILogger<StubPushNotificationService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string userId, string title, string message, string? link = null, CancellationToken ct = default)
    {
        _logger.LogInformation("Push notification to {UserId}: {Title}", userId, title);
        return Task.CompletedTask;
    }

    public Task RegisterDeviceTokenAsync(string userId, string deviceToken, string platform, CancellationToken ct = default)
    {
        _logger.LogInformation("Device token registered for {UserId} on {Platform}", userId, platform);
        return Task.CompletedTask;
    }

    public Task UnregisterDeviceTokenAsync(string userId, string deviceToken, CancellationToken ct = default)
    {
        _logger.LogInformation("Device token unregistered for {UserId}", userId);
        return Task.CompletedTask;
    }
}
