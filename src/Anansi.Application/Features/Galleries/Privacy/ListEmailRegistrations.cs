using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Privacy;

// GAL-1.6.4: View/export registered emails
public record ListEmailRegistrationsQuery(
    Guid CollectionId,
    int Page = 1,
    int PageSize = 50
) : IRequest<Result<PagedList<GalleryEmailRegistrationDto>>>;

public class ListEmailRegistrationsHandler : IRequestHandler<ListEmailRegistrationsQuery, Result<PagedList<GalleryEmailRegistrationDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListEmailRegistrationsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<GalleryEmailRegistrationDto>>> Handle(ListEmailRegistrationsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<GalleryEmailRegistrationDto>>.Forbidden("Not authenticated");

        var query = _db.GalleryEmailRegistrations
            .Where(r => r.CollectionId == request.CollectionId && r.PhotographerId == _currentUser.PhotographerId.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new GalleryEmailRegistrationDto(
                r.Id, r.CollectionId, r.Name, r.Email, r.CreatedAt
            ))
            .ToListAsync(ct);

        return Result<PagedList<GalleryEmailRegistrationDto>>.Success(
            new PagedList<GalleryEmailRegistrationDto>(items, totalCount, request.Page, request.PageSize));
    }
}
