using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using FluentValidation;
using MediatR;

namespace Anansi.Application.Features.Store.Commands;

/// <summary>
/// Creates a gift card (STR-2.4.3).
/// </summary>
public record CreateGiftCardCommand(CreateGiftCardRequest Request) : IRequest<Result<GiftCardDto>>;

public class CreateGiftCardValidator : AbstractValidator<CreateGiftCardCommand>
{
    public CreateGiftCardValidator()
    {
        RuleFor(x => x.Request.AmountCents).GreaterThan(0);
        RuleFor(x => x.Request.RecipientEmail).EmailAddress().When(x => !string.IsNullOrEmpty(x.Request.RecipientEmail));
    }
}

public class CreateGiftCardHandler : IRequestHandler<CreateGiftCardCommand, Result<GiftCardDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateGiftCardHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<GiftCardDto>> Handle(CreateGiftCardCommand cmd, CancellationToken ct)
    {
        if (_currentUser.PhotographerId is null)
            return Result<GiftCardDto>.Forbidden();

        var req = cmd.Request;
        var giftCard = new GiftCard
        {
            PhotographerId = _currentUser.PhotographerId.Value,
            Code = GenerateCode(),
            OriginalAmountCents = req.AmountCents,
            BalanceCents = req.AmountCents,
            ExpiryDate = req.ExpiryDate,
            RecipientEmail = req.RecipientEmail,
            RecipientName = req.RecipientName,
            SenderName = req.SenderName,
            Message = req.Message
        };

        _db.GiftCards.Add(giftCard);
        await _db.SaveChangesAsync(ct);

        return Result<GiftCardDto>.Success(new GiftCardDto(
            giftCard.Id, giftCard.Code, giftCard.OriginalAmountCents, giftCard.BalanceCents,
            giftCard.ExpiryDate, giftCard.RecipientEmail, giftCard.RecipientName,
            giftCard.SenderName, giftCard.Message, giftCard.IsActive, giftCard.CreatedAt));
    }

    private static string GenerateCode()
    {
        return Guid.NewGuid().ToString("N")[..12].ToUpperInvariant();
    }
}
