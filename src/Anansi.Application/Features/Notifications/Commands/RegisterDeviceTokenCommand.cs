using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Notifications.Commands;

public record RegisterDeviceTokenCommand(
    string DeviceToken,
    string Platform) : IRequest<Result>;

public class RegisterDeviceTokenCommandValidator : AbstractValidator<RegisterDeviceTokenCommand>
{
    public RegisterDeviceTokenCommandValidator()
    {
        RuleFor(x => x.DeviceToken).NotEmpty().MaximumLength(512);
        RuleFor(x => x.Platform).NotEmpty().MaximumLength(64);
    }
}

public class RegisterDeviceTokenCommandHandler : IRequestHandler<RegisterDeviceTokenCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IPushNotificationService _pushNotificationService;

    public RegisterDeviceTokenCommandHandler(
        ICurrentUserService currentUser,
        IPushNotificationService pushNotificationService)
    {
        _currentUser = currentUser;
        _pushNotificationService = pushNotificationService;
    }

    public async Task<Result> Handle(RegisterDeviceTokenCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUser.UserId))
        {
            return Result.Forbidden("Not authenticated");
        }

        await _pushNotificationService.RegisterDeviceTokenAsync(
            _currentUser.UserId,
            request.DeviceToken,
            request.Platform,
            ct);

        return Result.Success();
    }
}
