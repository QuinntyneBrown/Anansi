using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Auth.Commands;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : IRequest<Result>;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8).MaximumLength(128);
    }
}
