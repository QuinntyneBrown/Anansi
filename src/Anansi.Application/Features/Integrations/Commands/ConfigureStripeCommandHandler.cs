using Anansi.Application.Common;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Integrations.Commands;

public class ConfigureStripeCommandHandler : IRequestHandler<ConfigureStripeCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPaymentService _paymentService;

    public ConfigureStripeCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPaymentService paymentService)
    {
        _context = context;
        _currentUser = currentUser;
        _paymentService = paymentService;
    }

    public async Task<Result<string>> Handle(ConfigureStripeCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.PhotographerId == null)
            return Result<string>.Failure("Not authenticated.", 401);

        var photographer = await _context.Set<Photographer>()
            .FirstOrDefaultAsync(p => p.Id == _currentUser.PhotographerId.Value, cancellationToken);

        if (photographer == null)
            return Result<string>.NotFound("Photographer not found.");

        var stripeAccountId = await _paymentService.CreateConnectedAccountAsync(request.Email, request.Country, cancellationToken);

        photographer.StripeAccountId = stripeAccountId;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(stripeAccountId);
    }
}
