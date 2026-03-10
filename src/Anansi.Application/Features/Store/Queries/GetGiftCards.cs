using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Store.Queries;

public record GetGiftCardsQuery : IRequest<Result<List<GiftCardDto>>>;

public class GetGiftCardsHandler : IRequestHandler<GetGiftCardsQuery, Result<List<GiftCardDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetGiftCardsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<GiftCardDto>>> Handle(GetGiftCardsQuery query, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<List<GiftCardDto>>.Forbidden();

        var cards = await _db.GiftCards
            .Where(gc => gc.PhotographerId == _currentUser.PhotographerId)
            .OrderByDescending(gc => gc.CreatedAt)
            .ToListAsync(ct);

        return Result<List<GiftCardDto>>.Success(cards.Select(gc => new GiftCardDto(
            gc.Id, gc.Code, gc.OriginalAmountCents, gc.BalanceCents,
            gc.ExpiryDate, gc.RecipientEmail, gc.RecipientName,
            gc.SenderName, gc.Message, gc.IsActive, gc.CreatedAt)).ToList());
    }
}
