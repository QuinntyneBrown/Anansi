using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Events;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Events;

/// <summary>
/// Create a community event (EVT-24.1.2). Photographer's own events auto-approve (EVT-24.3.1 MVP).
/// </summary>
public record CreateEventCommand(
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime? EndDate,
    string? Venue,
    string? Neighborhood,
    EventCategory Category,
    EventRecurrence Recurrence,
    string? WebsiteUrl) : IRequest<Result<CommunityEventDto>>;

public class CreateEventValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventValidator()
    {
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

public class CreateEventHandler : IRequestHandler<CreateEventCommand, Result<CommunityEventDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateEventHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CommunityEventDto>> Handle(CreateEventCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var evt = new CommunityEvent
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Venue = request.Venue,
            Neighborhood = request.Neighborhood,
            Category = request.Category,
            Recurrence = request.Recurrence,
            WebsiteUrl = request.WebsiteUrl,
            SubmittedByPhotographerId = photographerId,
            // MVP: self-approve own events (EVT-24.3.1)
            Status = EventStatus.Approved,
            IsSeeded = false
        };

        _db.Set<CommunityEvent>().Add(evt);
        await _db.SaveChangesAsync(ct);

        return Result<CommunityEventDto>.Success(EventMapper.ToDto(evt));
    }
}
