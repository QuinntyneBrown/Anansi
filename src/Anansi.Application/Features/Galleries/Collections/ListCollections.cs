using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Interfaces;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Galleries.Collections;

public record ListCollectionsQuery(
    int Page = 1,
    int PageSize = 20,
    bool? StarredOnly = null,
    CollectionStatus? Status = null,
    string? Search = null
) : IRequest<Result<PagedList<CollectionSummaryDto>>>;

public class ListCollectionsHandler : IRequestHandler<ListCollectionsQuery, Result<PagedList<CollectionSummaryDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListCollectionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedList<CollectionSummaryDto>>> Handle(ListCollectionsQuery request, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<PagedList<CollectionSummaryDto>>.Forbidden("Not authenticated");

        var query = _db.Collections
            .Where(c => c.PhotographerId == _currentUser.PhotographerId.Value);

        if (request.StarredOnly == true)
            query = query.Where(c => c.IsStarred);

        if (request.Status.HasValue)
            query = query.Where(c => c.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(c => c.Title.Contains(request.Search));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CollectionSummaryDto(
                c.Id, c.Title, c.Slug, c.Status, c.CoverStyle, c.IsStarred, c.Language, c.CreatedAt,
                c.Sets.Count, c.Media.Count
            ))
            .ToListAsync(ct);

        return Result<PagedList<CollectionSummaryDto>>.Success(
            new PagedList<CollectionSummaryDto>(items, totalCount, request.Page, request.PageSize));
    }
}
