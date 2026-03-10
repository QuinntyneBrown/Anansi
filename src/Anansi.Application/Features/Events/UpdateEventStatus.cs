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
/// Moderate community events - approve or reject (EVT-24.3.1).
/// </summary>
public record UpdateEventStatusCommand(
    Guid EventId,
    EventStatus Status) : IRequest<Result<CommunityEventDto>>;

public class UpdateEventStatusValidator : AbstractValidator<UpdateEventStatusCommand>
{
    public UpdateEventStatusValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Status).IsInEnum()
            .Must(s => s == EventStatus.Approved || s == EventStatus.Rejected)
            .WithMessage("Status must be Approved or Rejected");
    }
}

public class UpdateEventStatusHandler : IRequestHandler<UpdateEventStatusCommand, Result<CommunityEventDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateEventStatusHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<CommunityEventDto>> Handle(UpdateEventStatusCommand request, CancellationToken ct)
    {
        var evt = await _db.Set<CommunityEvent>()
            .FirstOrDefaultAsync(e => e.Id == request.EventId, ct);

        if (evt is null)
            return Result<CommunityEventDto>.NotFound("Event not found");

        evt.Status = request.Status;
        await _db.SaveChangesAsync(ct);

        return Result<CommunityEventDto>.Success(EventMapper.ToDto(evt));
    }
}
