using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.CRM;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.CRM.Contacts;

public record ListContactsQuery(
    ContactType? TypeFilter,
    string? Search,
    int Page = 1,
    int PageSize = 25) : IRequest<Result<PagedList<ContactDto>>>;

public class ListContactsHandler : IRequestHandler<ListContactsQuery, Result<PagedList<ContactDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListContactsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<ContactDto>>> Handle(ListContactsQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId!.Value;
        var query = _db.Set<Contact>()
            .Where(c => c.PhotographerId == photographerId);

        if (request.TypeFilter.HasValue)
            query = query.Where(c => c.ContactType == request.TypeFilter.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(search) ||
                c.LastName.ToLower().Contains(search) ||
                c.Email.ToLower().Contains(search));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => CreateContactHandler.MapToDto(c))
            .ToListAsync(ct);

        return Result<PagedList<ContactDto>>.Success(
            new PagedList<ContactDto>(items, total, request.Page, request.PageSize));
    }
}
