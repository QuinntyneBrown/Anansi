using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Booking;

public record ListBookingsQuery(
    BookingStatus? StatusFilter,
    DateTime? From,
    DateTime? To,
    int Page = 1,
    int PageSize = 25) : IRequest<Result<PagedList<BookingRecordDto>>>;

public class ListBookingsHandler : IRequestHandler<ListBookingsQuery, Result<PagedList<BookingRecordDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListBookingsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<BookingRecordDto>>> Handle(ListBookingsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<BookingRecord>()
            .Include(b => b.SessionType)
            .Where(b => b.PhotographerId == photographerId);

        if (request.StatusFilter.HasValue)
            query = query.Where(b => b.Status == request.StatusFilter.Value);
        if (request.From.HasValue)
            query = query.Where(b => b.StartTime >= request.From.Value);
        if (request.To.HasValue)
            query = query.Where(b => b.StartTime <= request.To.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(b => b.StartTime)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new BookingRecordDto(
                b.Id, b.SessionTypeId, b.SessionType.Name, b.ContactId,
                b.ClientFirstName, b.ClientLastName, b.ClientEmail, b.ClientPhone,
                b.StartTime, b.EndTime, b.Status, b.Location,
                b.VideoCallLink, b.AmountPaidCents, b.CouponCode,
                b.DiscountCents, b.Notes, b.CreatedAt))
            .ToListAsync(ct);

        return Result<PagedList<BookingRecordDto>>.Success(
            new PagedList<BookingRecordDto>(items, total, request.Page, request.PageSize));
    }
}
