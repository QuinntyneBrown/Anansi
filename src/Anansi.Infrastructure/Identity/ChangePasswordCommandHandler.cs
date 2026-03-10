using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Application.Interfaces;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public ChangePasswordCommandHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
            return Result.Failure("Not authenticated.", 401);

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId);
        if (user == null)
            return Result.NotFound("User not found.");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return Result.Failure(
                string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return Result.Success();
    }
}
