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
/// Edit an own community event (EVT-24.3.2).
/// </summary>
public record UpdateEventCommand(
    Guid EventId,
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime? EndDate,
    string? Venue,
    string? Neighborhood,
    EventCategory Category,
    EventRecurrence Recurrence,
    string? WebsiteUrl) : IRequest<Result<CommunityEventDto>>;

public class UpdateEventValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(5000);
        RuleFor(x => x.Venue).MaximumLength(500);
        RuleFor(x => x.Neighborhood).MaximumLength(200);
        RuleFor(x => x.WebsiteUrl).MaximumLength(2000);
        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.EndDate.HasValue);
    }
}

public class UpdateEventHandler : IRequestHandler<UpdateEventCommand, Result<CommunityEventDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateEventHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CommunityEventDto>> Handle(UpdateEventCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var evt = await _db.Set<CommunityEvent>()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, ct);

        if (evt is null)
            return Result<CommunityEventDto>.NotFound("Event not found");

        if (evt.SubmittedByPhotographerId != photographerId)
            return Result<CommunityEventDto>.Forbidden("You can only edit your own events");

        evt.Name = request.Name;
        evt.Description = request.Description;
        evt.StartDate = request.StartDate;
        evt.EndDate = request.EndDate;
        evt.Venue = request.Venue;
        evt.Neighborhood = request.Neighborhood;
        evt.Category = request.Category;
        evt.Recurrence = request.Recurrence;
        evt.WebsiteUrl = request.WebsiteUrl;

        await _db.SaveChangesAsync(ct);

        return Result<CommunityEventDto>.Success(EventMapper.ToDto(evt));
    }
}
