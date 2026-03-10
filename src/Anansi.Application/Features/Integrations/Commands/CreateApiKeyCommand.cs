using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record CreateApiKeyCommand(string Name, DateTime? ExpiresAt = null) : IRequest<Result<ApiKeyResponse>>;

public record ApiKeyResponse(Guid Id, string Name, string ApiKey, string KeyPrefix, DateTime? ExpiresAt);

public class CreateApiKeyCommandValidator : AbstractValidator<CreateApiKeyCommand>
{
    public CreateApiKeyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
    }
}
