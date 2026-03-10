using Anansi.Application.Common;
using Anansi.Domain.Enums;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public record SaveCustomCodeInjectionCommand(
    string Code,
    CodeInjectionLocation Location,
    string? Label = null) : IRequest<Result<Guid>>;

public class SaveCustomCodeInjectionCommandValidator : AbstractValidator<SaveCustomCodeInjectionCommand>
{
    public SaveCustomCodeInjectionCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50000);
        RuleFor(x => x.Location).IsInEnum();
        RuleFor(x => x.Label).MaximumLength(256);
    }
}
