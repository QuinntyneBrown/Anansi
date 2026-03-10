using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Integrations;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigureInstagramFeedCommandHandler : IRequestHandler<ConfigureInstagramFeedCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConfigureInstagramFeedCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigureInstagramFeedCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result.NotFound("Photographer not found.");

        photographer.InstagramAccessToken = request.AccessToken;

        var config = await _context.InstagramFeedConfigs
            .FirstOrDefaultAsync(c => c.PhotographerId == _currentUser.PhotographerId.Value, cancellationToken);

        if (config == null)
        {
            config = new InstagramFeedConfig
            {
                PhotographerId = _currentUser.PhotographerId.Value,
                NumberOfPosts = request.NumberOfPosts,
                ImageSize = request.ImageSize,
                ClickBehavior = request.ClickBehavior
            };
            _context.InstagramFeedConfigs.Add(config);
        }
        else
        {
            config.NumberOfPosts = request.NumberOfPosts;
            config.ImageSize = request.ImageSize;
            config.ClickBehavior = request.ClickBehavior;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
