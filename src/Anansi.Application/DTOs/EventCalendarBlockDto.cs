using Anansi.Domain.Enums;

namespace Anansi.Application.DTOs;

public record EventCalendarBlockDto(
    Guid Id,
    Guid PhotographerId,
    Guid CommunityEventId,
    string EventName,
    CalendarBlockType BlockType,
    DateTime StartDate,
    DateTime EndDate,
    DateTime CreatedAt);
