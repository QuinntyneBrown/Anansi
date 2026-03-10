using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigureGalleryAssistCommand(
    Guid CollectionId,
    bool IsEnabled,
    bool ShowFavoritingGuide = true,
    bool ShowDownloadGuide = true,
    bool ShowStoreGuide = true,
    bool ShowSharingGuide = true) : IRequest<Result>;

public class ConfigureGalleryAssistCommandValidator : AbstractValidator<ConfigureGalleryAssistCommand>
{
    public ConfigureGalleryAssistCommandValidator()
    {
        RuleFor(x => x.CollectionId).NotEmpty();
    }
}
