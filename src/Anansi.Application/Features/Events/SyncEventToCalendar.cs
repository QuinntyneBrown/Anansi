using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Events;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Events;

/// <summary>
/// Sync an event to the photographer's booking calendar as a calendar block (EVT-24.2.2).
/// </summary>
public record SyncEventToCalendarCommand(
    Guid EventId,
    CalendarBlockType BlockType) : IRequest<Result<EventCalendarBlockDto>>;

public class SyncEventToCalendarValidator : AbstractValidator<SyncEventToCalendarCommand>
{
    public SyncEventToCalendarValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.BlockType).IsInEnum();
    }
}

public class SyncEventToCalendarHandler : IRequestHandler<SyncEventToCalendarCommand, Result<EventCalendarBlockDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SyncEventToCalendarHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<EventCalendarBlockDto>> Handle(SyncEventToCalendarCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var evt = await _db.Set<CommunityEvent>()
            .FirstOrDefaultAsync(e => e.Id == request.EventId && e.Status == EventStatus.Approved, ct);

        if (evt is null)
            return Result<EventCalendarBlockDto>.NotFound("Event not found or not approved");

        // Determine dates: use explicit dates if available, otherwise generate from typical months
        DateTime startDate;
        DateTime endDate;

        if (evt.StartDate.HasValue)
        {
            startDate = evt.StartDate.Value;
            endDate = evt.EndDate ?? evt.StartDate.Value;
        }
        else if (evt.TypicalStartMonth.HasValue)
        {
            var year = DateTime.UtcNow.Year;
            startDate = new DateTime(year, evt.TypicalStartMonth.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            var endMonth = evt.TypicalEndMonth ?? evt.TypicalStartMonth.Value;
            endDate = new DateTime(year, endMonth, DateTime.DaysInMonth(year, endMonth), 23, 59, 59, DateTimeKind.Utc);
        }
        else
        {
            return Result<EventCalendarBlockDto>.Failure("Event has no date information to sync");
        }

        // Check if already synced, update if so
        var existing = await _db.Set<EventCalendarBlock>()
            .FirstOrDefaultAsync(b => b.PhotographerId == photographerId && b.CommunityEventId == evt.Id, ct);

        if (existing is not null)
        {
            existing.BlockType = request.BlockType;
            existing.StartDate = startDate;
            existing.EndDate = endDate;
            await _db.SaveChangesAsync(ct);

            return Result<EventCalendarBlockDto>.Success(
                new EventCalendarBlockDto(existing.Id, existing.PhotographerId, existing.CommunityEventId,
                    evt.Name, existing.BlockType, existing.StartDate, existing.EndDate, existing.CreatedAt));
        }

        var block = new EventCalendarBlock
        {
            PhotographerId = photographerId,
            CommunityEventId = evt.Id,
            BlockType = request.BlockType,
            StartDate = startDate,
            EndDate = endDate
        };

        _db.Set<EventCalendarBlock>().Add(block);
        await _db.SaveChangesAsync(ct);

        return Result<EventCalendarBlockDto>.Success(
            new EventCalendarBlockDto(block.Id, block.PhotographerId, block.CommunityEventId,
                evt.Name, block.BlockType, block.StartDate, block.EndDate, block.CreatedAt));
    }
}
