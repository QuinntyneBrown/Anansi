using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Integrations;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigureGalleryAssistCommandHandler : IRequestHandler<ConfigureGalleryAssistCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ConfigureGalleryAssistCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ConfigureGalleryAssistCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var config = await _context.GalleryAssistConfigs
            .FirstOrDefaultAsync(g => g.PhotographerId == _currentUser.PhotographerId.Value
                && g.CollectionId == request.CollectionId, cancellationToken);

        if (config == null)
        {
            config = new GalleryAssistConfig
            {
                PhotographerId = _currentUser.PhotographerId.Value,
                CollectionId = request.CollectionId,
                IsEnabled = request.IsEnabled,
                ShowFavoritingGuide = request.ShowFavoritingGuide,
                ShowDownloadGuide = request.ShowDownloadGuide,
                ShowStoreGuide = request.ShowStoreGuide,
                ShowSharingGuide = request.ShowSharingGuide
            };
            _context.GalleryAssistConfigs.Add(config);
        }
        else
        {
            config.IsEnabled = request.IsEnabled;
            config.ShowFavoritingGuide = request.ShowFavoritingGuide;
            config.ShowDownloadGuide = request.ShowDownloadGuide;
            config.ShowStoreGuide = request.ShowStoreGuide;
            config.ShowSharingGuide = request.ShowSharingGuide;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
