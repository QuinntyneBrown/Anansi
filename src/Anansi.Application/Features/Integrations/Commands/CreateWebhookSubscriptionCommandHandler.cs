using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Integrations;
using MediatR;

namespace Anansi.Application.Features.Integrations.Commands;

public class CreateWebhookSubscriptionCommandHandler : IRequestHandler<CreateWebhookSubscriptionCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateWebhookSubscriptionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Guid>> Handle(CreateWebhookSubscriptionCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<Guid>.Failure("Not authenticated.", 401);

        var webhook = new WebhookSubscription
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Url = request.Url,
            EventType = request.EventType,
            Secret = request.Secret
        };

        _context.WebhookSubscriptions.Add(webhook);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(webhook.Id);
    }
}
