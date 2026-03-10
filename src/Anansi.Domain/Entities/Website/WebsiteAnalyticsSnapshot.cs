using Anansi.Domain.Common;

namespace Anansi.Domain.Entities.Website;

/// <summary>
/// WEB-3.7.1 - Built-In Analytics: daily snapshot of visitor analytics.
/// </summary>
public class WebsiteAnalyticsSnapshot : BaseEntity, ITenantEntity
{
    public Guid PhotographerId { get; set; }
    public Guid WebsiteId { get; set; }
    public Website Website { get; set; } = null!;

    public DateTime Date { get; set; }
    public int TotalVisitors { get; set; }
    public int UniqueVisitors { get; set; }
    public int PageViews { get; set; }
    public double AverageSessionDurationSeconds { get; set; }
    public string? GeographicDistributionJson { get; set; }
    public string? TopPagesJson { get; set; }
}
