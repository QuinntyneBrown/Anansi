using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Discovery.Commands;

public record UpdateCulturalTagsCommand(List<string> Tags) : IRequest<Result>;

public class UpdateCulturalTagsCommandValidator : AbstractValidator<UpdateCulturalTagsCommand>
{
    public UpdateCulturalTagsCommandValidator()
    {
        RuleFor(x => x.Tags).NotNull();
        RuleFor(x => x.Tags.Count).LessThanOrEqualTo(20)
            .WithMessage("Maximum 20 tags allowed.");
        RuleForEach(x => x.Tags).NotEmpty()
            .MaximumLength(50)
            .WithMessage("Each tag must be 50 characters or fewer.");
    }
}
