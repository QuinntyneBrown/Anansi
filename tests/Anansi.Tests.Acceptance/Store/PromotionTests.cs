using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Store;

/// <summary>
/// Acceptance tests for promotions and gift cards (STR-2.4.1, STR-2.4.2, STR-2.4.3).
/// </summary>
public class PromotionTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public PromotionTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// STR-2.4.1: Coupon types - percentage off.
    /// </summary>
    [Fact]
    public async Task Coupon_PercentageOff_ShouldPersist()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var coupon = new Coupon
        {
            PhotographerId = Guid.NewGuid(),
            Code = "SAVE20",
            CouponType = CouponType.PercentageOff,
            Scope = CouponScope.EntireOrder,
            PercentageValue = 20m,
            ExpirationDate = DateTime.UtcNow.AddDays(30),
            UsageLimit = 100,
            MinimumOrderCents = 5000
        };
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Coupons.FindAsync(coupon.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Code.Should().Be("SAVE20");
        result.CouponType.Should().Be(CouponType.PercentageOff);
        result.PercentageValue.Should().Be(20m);
        result.UsageLimit.Should().Be(100);
        result.MinimumOrderCents.Should().Be(5000);
    }

    /// <summary>
    /// STR-2.4.1: Coupon types - fixed amount off.
    /// </summary>
    [Fact]
    public async Task Coupon_FixedAmountOff_ShouldPersist()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var coupon = new Coupon
        {
            PhotographerId = Guid.NewGuid(),
            Code = "FLAT10",
            CouponType = CouponType.FixedAmountOff,
            Scope = CouponScope.SpecificItems,
            FixedAmountCents = 1000,
            ExpirationDate = null,
            UsageLimit = null
        };
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Coupons.FindAsync(coupon.Id);

        // Assert
        result.Should().NotBeNull();
        result!.CouponType.Should().Be(CouponType.FixedAmountOff);
        result.FixedAmountCents.Should().Be(1000);
        result.Scope.Should().Be(CouponScope.SpecificItems);
    }

    /// <summary>
    /// STR-2.4.1: Coupon types - free giveaway (Buy X Get Y Free).
    /// </summary>
    [Fact]
    public async Task Coupon_FreeGiveaway_ShouldPersist()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var coupon = new Coupon
        {
            PhotographerId = Guid.NewGuid(),
            Code = "BOGO",
            CouponType = CouponType.FreeGiveaway,
            Scope = CouponScope.EntireOrder
        };
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Coupons.FindAsync(coupon.Id);

        // Assert
        result.Should().NotBeNull();
        result!.CouponType.Should().Be(CouponType.FreeGiveaway);
    }

    /// <summary>
    /// STR-2.4.2: Coupon banner display.
    /// </summary>
    [Fact]
    public async Task Coupon_Banner_ShouldBeConfigurable()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var coupon = new Coupon
        {
            PhotographerId = Guid.NewGuid(),
            Code = "SPRING",
            CouponType = CouponType.PercentageOff,
            Scope = CouponScope.EntireOrder,
            PercentageValue = 15m,
            ShowBanner = true,
            BannerText = "Spring Sale! Use code SPRING for 15% off!",
            BannerColorHex = "#FF6B6B"
        };
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Coupons.FindAsync(coupon.Id);

        // Assert
        result.Should().NotBeNull();
        result!.ShowBanner.Should().BeTrue();
        result.BannerText.Should().Contain("SPRING");
        result.BannerColorHex.Should().Be("#FF6B6B");
    }

    /// <summary>
    /// STR-2.4.3: Gift card with balance tracking and partial use.
    /// </summary>
    [Fact]
    public async Task GiftCard_ShouldTrackBalanceAfterPartialUse()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var giftCard = new GiftCard
        {
            PhotographerId = Guid.NewGuid(),
            Code = "GC-ABC123",
            OriginalAmountCents = 10000,
            BalanceCents = 10000,
            ExpiryDate = DateTime.UtcNow.AddYears(1),
            RecipientEmail = "recipient@example.com",
            RecipientName = "Alice",
            SenderName = "Bob",
            Message = "Happy Birthday!"
        };
        db.GiftCards.Add(giftCard);
        await db.SaveChangesAsync();

        // Act - partial use
        giftCard.BalanceCents -= 3000; // Used $30 of $100
        await db.SaveChangesAsync();

        // Assert
        var result = await db.GiftCards.FindAsync(giftCard.Id);
        result.Should().NotBeNull();
        result!.OriginalAmountCents.Should().Be(10000);
        result.BalanceCents.Should().Be(7000); // $70 remaining
        result.RecipientEmail.Should().Be("recipient@example.com");
    }

    /// <summary>
    /// STR-2.4.3: Gift card as shareable code.
    /// </summary>
    [Fact]
    public async Task GiftCard_ShouldBeShareableAsCode()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var giftCard = new GiftCard
        {
            PhotographerId = Guid.NewGuid(),
            Code = "GC-XYZ789",
            OriginalAmountCents = 5000,
            BalanceCents = 5000
        };
        db.GiftCards.Add(giftCard);
        await db.SaveChangesAsync();

        // Act
        var result = await db.GiftCards.FindAsync(giftCard.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Code.Should().Be("GC-XYZ789");
        result.RecipientEmail.Should().BeNull(); // Shareable as code, not emailed
    }
}
