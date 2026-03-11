using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubStorageService : IStorageService
{
    private readonly ILogger<StubStorageService> _logger;

    public StubStorageService(ILogger<StubStorageService> logger)
    {
        _logger = logger;
    }

    public Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default)
    {
        var key = $"uploads/{Guid.NewGuid()}/{fileName}";
        _logger.LogInformation("Storage upload: {Key} ({ContentType})", key, contentType);
        return Task.FromResult(key);
    }

    public Task<Stream> DownloadAsync(string key, CancellationToken ct = default)
    {
        _logger.LogInformation("Storage download: {Key}", key);
        return Task.FromResult<Stream>(new MemoryStream());
    }

    public Task DeleteAsync(string key, CancellationToken ct = default)
    {
        _logger.LogInformation("Storage delete: {Key}", key);
        return Task.CompletedTask;
    }

    public Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry, CancellationToken ct = default)
    {
        _logger.LogInformation("Storage presigned URL: {Key}", key);
        return Task.FromResult($"http://localhost:9000/{key}?expiry={expiry.TotalSeconds}");
    }
}
