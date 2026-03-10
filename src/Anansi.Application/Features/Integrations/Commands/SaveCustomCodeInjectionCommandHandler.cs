using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Integrations;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public class SaveCustomCodeInjectionCommandHandler : IRequestHandler<SaveCustomCodeInjectionCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SaveCustomCodeInjectionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Guid>> Handle(SaveCustomCodeInjectionCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<Guid>.Failure("Not authenticated.", 401);

        var injection = new CustomCodeInjection
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Code = request.Code,
            Location = request.Location,
            Label = request.Label
        };

        _context.CustomCodeInjections.Add(injection);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(injection.Id);
    }
}
