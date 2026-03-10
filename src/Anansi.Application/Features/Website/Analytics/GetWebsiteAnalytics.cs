using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Analytics;

/// <summary>
/// WEB-3.7.1 - Built-In Analytics: visitors, page views, geographic distribution, session duration, top pages.
/// </summary>
public record GetWebsiteAnalyticsQuery(
    Guid WebsiteId,
    DateTime StartDate,
    DateTime EndDate) : IRequest<Result<WebsiteAnalyticsDto>>;

public class GetWebsiteAnalyticsHandler : IRequestHandler<GetWebsiteAnalyticsQuery, Result<WebsiteAnalyticsDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetWebsiteAnalyticsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<WebsiteAnalyticsDto>> Handle(GetWebsiteAnalyticsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<WebsiteAnalyticsDto>.Failure("Not authenticated", 401);

        var website = await _db.Set<Domain.Entities.Website.Website>()
            .FirstOrDefaultAsync(w => w.Id == request.WebsiteId && w.PhotographerId == photographerId.Value, ct);
        if (website is null)
            return Result<WebsiteAnalyticsDto>.NotFound("Website not found");

        var snapshots = await _db.Set<Domain.Entities.Website.WebsiteAnalyticsSnapshot>()
            .Where(s => s.WebsiteId == request.WebsiteId
                && s.Date >= request.StartDate
                && s.Date <= request.EndDate)
            .OrderBy(s => s.Date)
            .ToListAsync(ct);

        var dailySnapshots = snapshots.Select(s => new DailyAnalyticsDto(
            s.Date, s.TotalVisitors, s.UniqueVisitors, s.PageViews,
            s.AverageSessionDurationSeconds, s.GeographicDistributionJson, s.TopPagesJson))
            .ToList();

        var totals = new WebsiteAnalyticsDto(
            request.WebsiteId,
            request.StartDate,
            request.EndDate,
            snapshots.Sum(s => s.TotalVisitors),
            snapshots.Sum(s => s.UniqueVisitors),
            snapshots.Sum(s => s.PageViews),
            snapshots.Count > 0 ? snapshots.Average(s => s.AverageSessionDurationSeconds) : 0,
            dailySnapshots);

        return Result<WebsiteAnalyticsDto>.Success(totals);
    }
}
