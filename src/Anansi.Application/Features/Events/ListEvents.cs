using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Events;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Events;

/// <summary>
/// List events by date range with optional filters (EVT-24.2.1).
/// Public endpoint - no auth required. Annual recurring events generate instances for the queried year.
/// </summary>
public record ListEventsQuery(
    DateTime? From,
    DateTime? To,
    EventCategory? Category,
    string? Neighborhood) : IRequest<Result<IReadOnlyList<CommunityEventDto>>>;

public class ListEventsHandler : IRequestHandler<ListEventsQuery, Result<IReadOnlyList<CommunityEventDto>>>
{
    private readonly IApplicationDbContext _db;

    public ListEventsHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Result<IReadOnlyList<CommunityEventDto>>> Handle(ListEventsQuery request, CancellationToken ct)
    {
        var query = _db.Set<CommunityEvent>()
            .Where(e => e.Status == EventStatus.Approved)
            .AsQueryable();

        if (request.Category.HasValue)
            query = query.Where(e => e.Category == request.Category.Value);

        if (!string.IsNullOrWhiteSpace(request.Neighborhood))
            query = query.Where(e => e.Neighborhood != null && e.Neighborhood == request.Neighborhood);

        var events = await query.OrderBy(e => e.StartDate ?? DateTime.MaxValue)
            .ThenBy(e => e.Name)
            .ToListAsync(ct);

        var results = new List<CommunityEventDto>();

        foreach (var evt in events)
        {
            if (evt.Recurrence == EventRecurrence.Annual && evt.TypicalStartMonth.HasValue)
            {
                // Generate instances for the queried year(s)
                var instances = GenerateAnnualInstances(evt, request.From, request.To);
                results.AddRange(instances);
            }
            else
            {
                // Non-recurring or non-annual: apply date filter directly
                if (request.From.HasValue && evt.EndDate.HasValue && evt.EndDate < request.From)
                    continue;
                if (request.To.HasValue && evt.StartDate.HasValue && evt.StartDate > request.To)
                    continue;

                results.Add(EventMapper.ToDto(evt));
            }
        }

        var ordered = results.OrderBy(e => e.StartDate ?? DateTime.MaxValue)
            .ThenBy(e => e.Name)
            .ToList();

        return Result<IReadOnlyList<CommunityEventDto>>.Success(ordered);
    }

    private static IEnumerable<CommunityEventDto> GenerateAnnualInstances(
        CommunityEvent evt, DateTime? from, DateTime? to)
    {
        int startYear = from?.Year ?? DateTime.UtcNow.Year;
        int endYear = to?.Year ?? startYear;

        for (int year = startYear; year <= endYear; year++)
        {
            var startMonth = evt.TypicalStartMonth!.Value;
            var endMonth = evt.TypicalEndMonth ?? startMonth;

            var instanceStart = new DateTime(year, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var instanceEnd = new DateTime(year, endMonth, DateTime.DaysInMonth(year, endMonth), 23, 59, 59, DateTimeKind.Utc);

            // Apply date filter
            if (from.HasValue && instanceEnd < from.Value)
                continue;
            if (to.HasValue && instanceStart > to.Value)
                continue;

            yield return new CommunityEventDto(
                evt.Id, evt.Name, evt.Description, evt.Venue, evt.Neighborhood, evt.Category,
                instanceStart, instanceEnd, evt.Recurrence,
                evt.TypicalStartMonth, evt.TypicalEndMonth,
                evt.WebsiteUrl, evt.Status, evt.IsSeeded,
                evt.SubmittedByPhotographerId, evt.CreatedAt);
        }
    }
}
