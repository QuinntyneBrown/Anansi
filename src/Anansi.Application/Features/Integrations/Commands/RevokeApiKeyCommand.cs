using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record RevokeApiKeyCommand(Guid Id) : IRequest<Result>;

public class RevokeApiKeyCommandValidator : AbstractValidator<RevokeApiKeyCommand>
{
    public RevokeApiKeyCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
