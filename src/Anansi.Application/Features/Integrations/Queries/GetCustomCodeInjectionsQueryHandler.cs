using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Queries;

public class GetCustomCodeInjectionsQueryHandler : IRequestHandler<GetCustomCodeInjectionsQuery, Result<IReadOnlyList<CustomCodeInjectionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCustomCodeInjectionsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<CustomCodeInjectionDto>>> Handle(GetCustomCodeInjectionsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<IReadOnlyList<CustomCodeInjectionDto>>.Failure("Not authenticated.", 401);

        var injections = await _context.CustomCodeInjections
            .Where(c => c.PhotographerId == _currentUser.PhotographerId.Value)
            .Select(c => new CustomCodeInjectionDto(
                c.Id,
                c.Code,
                c.Location,
                c.IsActive,
                c.Label))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<CustomCodeInjectionDto>>.Success(injections);
    }
}
