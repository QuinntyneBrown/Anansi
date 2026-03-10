namespace Anansi.Application.DTOs;

public record AutomatedEmailConfigDto(
    Guid Id,
    string EventType,
    bool IsEnabled,
    Guid? EmailTemplateId,
    int? TimingOffsetHours,
    int? ReminderFrequencyDays,
    string? RecipientTypes,
    string? DaysBeforeEvent);
