using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly SignInManager<ApplicationUser> _signInManager;

    public LogoutCommandHandler(SignInManager<ApplicationUser> signInManager)
    {
        _signInManager = signInManager;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _signInManager.SignOutAsync();
        return Result.Success();
    }
}
