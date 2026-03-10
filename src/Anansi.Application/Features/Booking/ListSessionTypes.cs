using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Booking;

public record ListSessionTypesQuery : IRequest<Result<IReadOnlyList<SessionTypeDto>>>;

public class ListSessionTypesHandler : IRequestHandler<ListSessionTypesQuery, Result<IReadOnlyList<SessionTypeDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListSessionTypesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<SessionTypeDto>>> Handle(ListSessionTypesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var items = await _db.Set<SessionType>()
            .Where(s => s.PhotographerId == photographerId)
            .OrderBy(s => s.SortOrder)
            .Select(s => CreateSessionTypeHandler.MapToDto(s))
            .ToListAsync(ct);

        return Result<IReadOnlyList<SessionTypeDto>>.Success(items);
    }
}
