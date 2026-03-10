namespace Anansi.Application.DTOs.Website;

public record WebsiteAnalyticsDto(
    Guid WebsiteId,
    DateTime StartDate,
    DateTime EndDate,
    int TotalVisitors,
    int UniqueVisitors,
    int PageViews,
    double AverageSessionDurationSeconds,
    List<DailyAnalyticsDto> DailySnapshots);

public record DailyAnalyticsDto(
    DateTime Date,
    int TotalVisitors,
    int UniqueVisitors,
    int PageViews,
    double AverageSessionDurationSeconds,
    string? GeographicDistributionJson,
    string? TopPagesJson);
