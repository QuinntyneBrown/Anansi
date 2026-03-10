using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Booking;

/// <summary>
/// Accept or decline a pending booking (BKG-4.3.7).
/// </summary>
public record ConfirmBookingCommand(Guid BookingId, bool Accept) : IRequest<Result>;

public class ConfirmBookingHandler : IRequestHandler<ConfirmBookingCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ConfirmBookingHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfirmBookingCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var booking = await _db.Set<BookingRecord>()
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.PhotographerId == photographerId, ct);

        if (booking is null) return Result.NotFound("Booking not found");
        if (booking.Status != BookingStatus.Pending)
            return Result.Failure("Only pending bookings can be confirmed or declined.");

        booking.Status = request.Accept ? BookingStatus.Confirmed : BookingStatus.Declined;
        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
