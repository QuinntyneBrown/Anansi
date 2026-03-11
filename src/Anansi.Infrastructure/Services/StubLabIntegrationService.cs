using Anansi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Anansi.Infrastructure.Services;

public class StubLabIntegrationService : ILabIntegrationService
{
    private readonly ILogger<StubLabIntegrationService> _logger;

    public StubLabIntegrationService(ILogger<StubLabIntegrationService> logger)
    {
        _logger = logger;
    }

    public Task<string> SubmitOrderAsync(LabOrderRequest request, CancellationToken ct = default)
    {
        var id = $"lab_stub_{Guid.NewGuid():N}";
        _logger.LogInformation("Lab order submitted: {Id} to {Lab}", id, request.LabName);
        return Task.FromResult(id);
    }

    public Task<LabOrderStatusResult> GetOrderStatusAsync(string labName, string externalOrderId, CancellationToken ct = default)
    {
        _logger.LogInformation("Lab order status: {OrderId} from {Lab}", externalOrderId, labName);
        return Task.FromResult(new LabOrderStatusResult { Status = "pending" });
    }

    public Task<IReadOnlyList<LabPricingResult>> GetPricingAsync(string labName, CancellationToken ct = default)
    {
        _logger.LogInformation("Lab pricing requested: {Lab}", labName);
        return Task.FromResult<IReadOnlyList<LabPricingResult>>(Array.Empty<LabPricingResult>());
    }
}
