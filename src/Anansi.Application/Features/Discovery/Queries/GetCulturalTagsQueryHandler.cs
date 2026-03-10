using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Discovery.Queries;

public class GetCulturalTagsQueryHandler : IRequestHandler<GetCulturalTagsQuery, Result<List<string>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCulturalTagsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<string>>> Handle(GetCulturalTagsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<List<string>>.Failure("Not authenticated.", 401);

        var photographerId = _currentUser.PhotographerId.Value;

        var tags = await _context.PhotographerCulturalTags
            .Where(pt => pt.PhotographerId == photographerId)
            .Include(pt => pt.CulturalTag)
            .Select(pt => pt.CulturalTag.Name)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Success(tags);
    }
}
