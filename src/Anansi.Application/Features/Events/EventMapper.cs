using Anansi.Application.DTOs;
using Anansi.Domain.Entities.Events;

namespace Anansi.Application.Features.Events;

internal static class EventMapper
{
    internal static CommunityEventDto ToDto(CommunityEvent e) =>
        new(e.Id, e.Name, e.Description, e.Venue, e.Neighborhood, e.Category,
            e.StartDate, e.EndDate, e.Recurrence,
            e.TypicalStartMonth, e.TypicalEndMonth,
            e.WebsiteUrl, e.Status, e.IsSeeded,
            e.SubmittedByPhotographerId, e.CreatedAt);
}
