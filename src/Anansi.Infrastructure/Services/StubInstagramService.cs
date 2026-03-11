using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubInstagramService : IInstagramService
{
    private readonly ILogger<StubInstagramService> _logger;

    public StubInstagramService(ILogger<StubInstagramService> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<InstagramPost>> GetFeedAsync(string accessToken, int count, CancellationToken ct = default)
    {
        _logger.LogInformation("Instagram feed requested: {Count} posts", count);
        return Task.FromResult<IReadOnlyList<InstagramPost>>(Array.Empty<InstagramPost>());
    }
}
