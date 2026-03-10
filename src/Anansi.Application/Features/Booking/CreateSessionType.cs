using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Booking;

public record CreateSessionTypeCommand(
    string Name,
    string? Description,
    int DurationMinutes,
    long PriceCents,
    string? Location,
    SessionVisibility Visibility,
    int BufferBeforeMinutes,
    int BufferAfterMinutes,
    bool RequireManualConfirmation,
    bool IsMiniSession,
    int MiniSessionGapMinutes,
    int MiniSessionSpotsPerSlot,
    string? AvailabilityWindows,
    string? VideoCallType,
    bool RequirePayment,
    long? DepositAmountCents,
    string? IntakeDocumentIds,
    string? CoverImageUrl,
    Guid? CommunityEventId = null) : IRequest<Result<SessionTypeDto>>;

public class CreateSessionTypeValidator : AbstractValidator<CreateSessionTypeCommand>
{
    public CreateSessionTypeValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.DurationMinutes).GreaterThan(0);
        RuleFor(x => x.PriceCents).GreaterThanOrEqualTo(0);
    }
}

public class CreateSessionTypeHandler : IRequestHandler<CreateSessionTypeCommand, Result<SessionTypeDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateSessionTypeHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<SessionTypeDto>> Handle(CreateSessionTypeCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;

        var sessionType = new SessionType
        {
            PhotographerId = photographerId,
            Name = request.Name,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes,
            PriceCents = request.PriceCents,
            Location = request.Location,
            Visibility = request.Visibility,
            BufferBeforeMinutes = request.BufferBeforeMinutes,
            BufferAfterMinutes = request.BufferAfterMinutes,
            RequireManualConfirmation = request.RequireManualConfirmation,
            IsMiniSession = request.IsMiniSession,
            MiniSessionGapMinutes = request.MiniSessionGapMinutes,
            MiniSessionSpotsPerSlot = request.MiniSessionSpotsPerSlot,
            AvailabilityWindows = request.AvailabilityWindows,
            VideoCallType = request.VideoCallType,
            RequirePayment = request.RequirePayment,
            DepositAmountCents = request.DepositAmountCents,
            IntakeDocumentIds = request.IntakeDocumentIds,
            CoverImageUrl = request.CoverImageUrl,
            CommunityEventId = request.CommunityEventId
        };

        _db.Set<SessionType>().Add(sessionType);
        await _db.SaveChangesAsync(ct);

        return Result<SessionTypeDto>.Success(MapToDto(sessionType));
    }

    internal static SessionTypeDto MapToDto(SessionType s) =>
        new(s.Id, s.Name, s.Description, s.DurationMinutes, s.PriceCents, s.Location,
            s.Visibility, s.SortOrder, s.BufferBeforeMinutes, s.BufferAfterMinutes,
            s.RequireManualConfirmation, s.IsMiniSession, s.MiniSessionGapMinutes,
            s.MiniSessionSpotsPerSlot, s.AvailabilityWindows, s.VideoCallType,
            s.RequirePayment, s.DepositAmountCents, s.IntakeDocumentIds, s.CoverImageUrl,
            s.CommunityEventId, s.CreatedAt);
}
