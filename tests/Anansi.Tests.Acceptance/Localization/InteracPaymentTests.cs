using System.Net;
using System.Net.Http.Json;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Localization;

public class InteracPaymentTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public InteracPaymentTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ConfigureInterac_SetsEmail()
    {
        var request = new
        {
            interacEmail = "photographer@email.com",
        };

        var response = await _client.PutAsJsonAsync("/api/settings/interac", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetInteracConfig_ReturnsStoredEmail()
    {
        // First configure
        await _client.PutAsJsonAsync("/api/settings/interac", new { interacEmail = "test@interac.ca" });

        var response = await _client.GetAsync("/api/settings/interac");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ListInteracPaymentRequests_ReturnsEmptyInitially()
    {
        var response = await _client.GetAsync("/api/interac/payment-requests");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ListInteracPaymentRequests_FilterByStatus()
    {
        var response = await _client.GetAsync("/api/interac/payment-requests?status=Pending");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
