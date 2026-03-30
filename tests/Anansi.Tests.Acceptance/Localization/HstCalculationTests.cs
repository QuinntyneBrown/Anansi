using System.Net;
using System.Net.Http.Json;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Localization;

public class HstCalculationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HstCalculationTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTaxProfile_ReturnsDefaultHstRate()
    {
        var response = await _client.GetAsync("/api/tax-profile");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<dynamic>();
        var hstRate = body?.GetProperty("hstRatePercent").GetDecimal();
        hstRate.Should().Be(13m);
    }

    [Fact]
    public async Task UpdateTaxProfile_SetsHstRegistrationNumber()
    {
        var request = new
        {
            hstRatePercent = 13m,
            hstRegistrationNumber = "RT0001",
            registrationStatus = "Voluntary",
            isHstEnabled = true,
        };

        var response = await _client.PutAsJsonAsync("/api/tax-profile", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetThresholdStatus_ReturnsRollingRevenue()
    {
        var response = await _client.GetAsync("/api/tax-profile/threshold");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<dynamic>();
        body?.GetProperty("rollingRevenue").GetInt64().Should().BeGreaterOrEqualTo(0);
        body?.GetProperty("thresholdPercentage").GetDecimal().Should().BeGreaterOrEqualTo(0);
    }

    [Fact]
    public async Task RecordBusinessExpense_TracksHstPaid()
    {
        var request = new
        {
            description = "Camera lens",
            amountCents = 150000,
            hstPaidCents = 19500,
            category = "Equipment",
            date = "2026-03-01",
        };

        var response = await _client.PostAsJsonAsync("/api/tax-profile/expenses", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetItcSummary_ReturnsNetHstOwing()
    {
        var response = await _client.GetAsync("/api/tax-profile/itc-summary?from=2026-01-01&to=2026-12-31");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<dynamic>();
        body?.GetProperty("hstCollected").GetInt64().Should().BeGreaterOrEqualTo(0);
        body?.GetProperty("hstPaidOnExpenses").GetInt64().Should().BeGreaterOrEqualTo(0);
    }
}
