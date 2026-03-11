using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Notifications.Commands;

public record UnregisterDeviceTokenCommand(
    string DeviceToken) : IRequest<Result>;

public class UnregisterDeviceTokenCommandValidator : AbstractValidator<UnregisterDeviceTokenCommand>
{
    public UnregisterDeviceTokenCommandValidator()
    {
        RuleFor(x => x.DeviceToken).NotEmpty().MaximumLength(512);
    }
}

public class UnregisterDeviceTokenCommandHandler : IRequestHandler<UnregisterDeviceTokenCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IPushNotificationService _pushNotificationService;

    public UnregisterDeviceTokenCommandHandler(
        ICurrentUserService currentUser,
        IPushNotificationService pushNotificationService)
    {
        _currentUser = currentUser;
        _pushNotificationService = pushNotificationService;
    }

    public async Task<Result> Handle(UnregisterDeviceTokenCommand request, CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUser.UserId))
        {
            return Result.Forbidden("Not authenticated");
        }

        await _pushNotificationService.UnregisterDeviceTokenAsync(
            _currentUser.UserId,
            request.DeviceToken,
            ct);

        return Result.Success();
    }
}
