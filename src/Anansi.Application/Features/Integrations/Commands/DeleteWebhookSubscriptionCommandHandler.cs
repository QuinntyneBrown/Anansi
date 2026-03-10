using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class DeleteWebhookSubscriptionCommandHandler : IRequestHandler<DeleteWebhookSubscriptionCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteWebhookSubscriptionCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteWebhookSubscriptionCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result.Failure("Not authenticated.", 401);

        var webhook = await _context.WebhookSubscriptions
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.PhotographerId == _currentUser.PhotographerId.Value, cancellationToken);

        if (webhook == null)
            return Result.NotFound("Webhook subscription not found.");

        webhook.IsDeleted = true;
        webhook.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
