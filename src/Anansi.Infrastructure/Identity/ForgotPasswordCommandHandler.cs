using Anansi.Application.Common;
using Anansi.Application.Features.Auth.Commands;
using Anansi.Application.Interfaces;
using Anansi.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Anansi.Infrastructure.Identity;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        UserManager<ApplicationUser> userManager,
        IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Return success even if user not found to prevent email enumeration
            return Result.Success();
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        await _emailService.SendTemplatedAsync(
            request.Email,
            "password-reset",
            new Dictionary<string, string>
            {
                { "ResetToken", token },
                { "Email", request.Email }
            },
            cancellationToken);

        return Result.Success();
    }
}
