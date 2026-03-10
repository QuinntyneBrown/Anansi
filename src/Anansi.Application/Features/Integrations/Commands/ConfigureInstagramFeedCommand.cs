using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record ConfigureInstagramFeedCommand(
    string AccessToken,
    int NumberOfPosts,
    string ImageSize,
    string ClickBehavior) : IRequest<Result>;

public class ConfigureInstagramFeedCommandValidator : AbstractValidator<ConfigureInstagramFeedCommand>
{
    public ConfigureInstagramFeedCommandValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty();
        RuleFor(x => x.NumberOfPosts).InclusiveBetween(1, 50);
        RuleFor(x => x.ImageSize).NotEmpty().Must(s => s is "small" or "medium" or "large");
        RuleFor(x => x.ClickBehavior).NotEmpty().Must(s => s is "open_instagram" or "lightbox");
    }
}
