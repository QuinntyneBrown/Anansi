using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubEmailService : IEmailService
{
    private readonly ILogger<StubEmailService> _logger;

    public StubEmailService(ILogger<StubEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        _logger.LogInformation("Email to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendTemplatedAsync(string to, string templateId, Dictionary<string, string> variables, CancellationToken ct = default)
    {
        _logger.LogInformation("Templated email to {To}: template={Template}", to, templateId);
        return Task.CompletedTask;
    }
}
