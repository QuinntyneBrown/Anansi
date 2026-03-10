using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Application.Interfaces;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<LoginResponse>.Failure("Invalid email or password.", 401);

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
        {
            if (signInResult.IsLockedOut)
                return Result<LoginResponse>.Failure("Account is locked out. Please try again later.", 423);
            return Result<LoginResponse>.Failure("Invalid email or password.", 401);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateAccessToken(user.Id, user.Email!, user.PhotographerId, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        return Result<LoginResponse>.Success(
            new LoginResponse(token, refreshToken, expiresAt, user.PhotographerId));
    }
}
