using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Queries;

public class GetWebhookSubscriptionsQueryHandler : IRequestHandler<GetWebhookSubscriptionsQuery, Result<IReadOnlyList<WebhookSubscriptionDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWebhookSubscriptionsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<IReadOnlyList<WebhookSubscriptionDto>>> Handle(GetWebhookSubscriptionsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<IReadOnlyList<WebhookSubscriptionDto>>.Failure("Not authenticated.", 401);

        var webhooks = await _context.WebhookSubscriptions
            .Where(w => w.PhotographerId == _currentUser.PhotographerId.Value)
            .Select(w => new WebhookSubscriptionDto(
                w.Id,
                w.Url,
                w.EventType,
                w.IsActive,
                w.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<WebhookSubscriptionDto>>.Success(webhooks);
    }
}
