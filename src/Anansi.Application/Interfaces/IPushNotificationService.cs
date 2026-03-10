namespace Anansi.Application.Interfaces;

public interface IPushNotificationService
{
    Task SendAsync(string userId, string title, string message, string? link = null, CancellationToken ct = default);
    Task RegisterDeviceTokenAsync(string userId, string deviceToken, string platform, CancellationToken ct = default);
    Task UnregisterDeviceTokenAsync(string userId, string deviceToken, CancellationToken ct = default);
}
