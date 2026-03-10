using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Auth.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string BusinessName) : IRequest<Result<RegisterResponse>>;

public record RegisterResponse(
    string UserId,
    Guid PhotographerId,
    string Token);

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(256);
    }
}
