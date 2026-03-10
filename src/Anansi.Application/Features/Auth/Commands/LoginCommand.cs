using Anansi.Application.Common;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Auth.Commands;

public record LoginCommand(
    string Email,
    string Password) : IRequest<Result<LoginResponse>>;

public record LoginResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    Guid? PhotographerId);

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
