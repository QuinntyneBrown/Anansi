using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record CommunityEventDto(
    Guid Id,
    string Name,
    string? Description,
    string? Venue,
    string? Neighborhood,
    EventCategory Category,
    DateTime? StartDate,
    DateTime? EndDate,
    EventRecurrence Recurrence,
    int? TypicalStartMonth,
    int? TypicalEndMonth,
    string? WebsiteUrl,
    EventStatus Status,
    bool IsSeeded,
    Guid? SubmittedByPhotographerId,
    DateTime CreatedAt);
