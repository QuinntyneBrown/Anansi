using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ResetPasswordCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result.Failure("Invalid request.");

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            return Result.Failure(
                string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return Result.Success();
    }
}
