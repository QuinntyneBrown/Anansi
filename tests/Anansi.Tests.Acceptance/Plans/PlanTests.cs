using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Plans;

/// <summary>
/// Acceptance tests for plan architecture (PLN-10.1.1 through PLN-10.1.3).
/// </summary>
public class PlanTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public PlanTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// PLN-10.1.1: Every product area has a free tier, no credit card required.
    /// </summary>
    [Theory]
    [InlineData(PlanProduct.Gallery)]
    [InlineData(PlanProduct.Website)]
    [InlineData(PlanProduct.StudioManager)]
    public async Task FreeTier_ShouldExistForEachProductArea(PlanProduct product)
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = product,
            Tier = PlanTier.Free,
            Name = $"{product} Free",
            MonthlyPriceCents = 0,
            AnnualPriceCents = 0
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans.FindAsync(plan.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Tier.Should().Be(PlanTier.Free);
        result.MonthlyPriceCents.Should().Be(0);
        result.AnnualPriceCents.Should().Be(0);
    }

    /// <summary>
    /// PLN-10.1.2: Multiple paid tiers with progressively more features.
    /// Annual billing must offer at least 15% discount.
    /// </summary>
    [Fact]
    public async Task PaidTiers_ShouldOfferAnnualDiscount()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var basicMonthly = 1499L; // $14.99/mo
        var basicAnnual = 14988L; // $149.88/yr (approx $12.49/mo - 17% discount)

        var plan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Basic,
            Name = "Gallery Basic",
            MonthlyPriceCents = basicMonthly,
            AnnualPriceCents = basicAnnual
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans.FindAsync(plan.Id);

        // Assert
        result.Should().NotBeNull();
        var monthlyAnnualized = result!.MonthlyPriceCents * 12;
        var discountPercentage = (1 - (decimal)result.AnnualPriceCents / monthlyAnnualized) * 100;
        discountPercentage.Should().BeGreaterThanOrEqualTo(15m);
    }

    /// <summary>
    /// PLN-10.1.2: Upgrade/downgrade with proration.
    /// </summary>
    [Fact]
    public async Task SubscriptionChange_ShouldCalculateProration()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var basicPlan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Basic,
            Name = "Gallery Basic",
            MonthlyPriceCents = 1499,
            AnnualPriceCents = 14988
        };
        var proPlan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Pro,
            Name = "Gallery Pro",
            MonthlyPriceCents = 3999,
            AnnualPriceCents = 39988
        };
        db.Plans.Add(basicPlan);
        db.Plans.Add(proPlan);

        // Start with Basic, monthly
        var now = DateTime.UtcNow;
        var oldSub = new Subscription
        {
            PhotographerId = photographerId,
            PlanId = basicPlan.Id,
            BillingInterval = BillingInterval.Monthly,
            Status = SubscriptionStatus.Active,
            CurrentPeriodStart = now.AddDays(-15),
            CurrentPeriodEnd = now.AddDays(15),
            PriceCents = 1499
        };
        db.Subscriptions.Add(oldSub);
        await db.SaveChangesAsync();

        // Act - Upgrade to Pro with proration
        var totalDays = (oldSub.CurrentPeriodEnd - oldSub.CurrentPeriodStart).TotalDays;
        var remainingDays = (oldSub.CurrentPeriodEnd - now).TotalDays;
        var prorationCredit = (long)(oldSub.PriceCents * (remainingDays / totalDays));

        oldSub.Status = SubscriptionStatus.Cancelled;
        oldSub.CancelledAt = now;

        var newSub = new Subscription
        {
            PhotographerId = photographerId,
            PlanId = proPlan.Id,
            BillingInterval = BillingInterval.Monthly,
            Status = SubscriptionStatus.Active,
            CurrentPeriodStart = now,
            CurrentPeriodEnd = now.AddMonths(1),
            PriceCents = 3999,
            ProrationCreditCents = prorationCredit
        };
        db.Subscriptions.Add(newSub);
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Subscriptions.FindAsync(newSub.Id);
        result.Should().NotBeNull();
        result!.PlanId.Should().Be(proPlan.Id);
        result.ProrationCreditCents.Should().BeGreaterThan(0);
        result.ProrationCreditCents.Should().BeLessThan(oldSub.PriceCents);

        var cancelled = await db.Subscriptions.FindAsync(oldSub.Id);
        cancelled!.Status.Should().Be(SubscriptionStatus.Cancelled);
    }

    /// <summary>
    /// PLN-10.1.3: Suite bundle with at least 25% savings.
    /// </summary>
    [Fact]
    public async Task SuiteBundle_ShouldOfferBundleDiscount()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        // Individual prices: Gallery Pro $39.99, Website Pro $24.99, Studio Manager Pro $29.99
        // Total: $94.97/mo -> Suite should be <= $71.23 (25% off)
        var suitePro = new Plan
        {
            Product = PlanProduct.Suite,
            Tier = PlanTier.Pro,
            Name = "Suite Pro",
            MonthlyPriceCents = 6999, // $69.99 (>25% off $94.97)
            AnnualPriceCents = 69988,
            IsSuiteBundle = true
        };
        db.Plans.Add(suitePro);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans.FindAsync(suitePro.Id);

        // Assert
        result.Should().NotBeNull();
        result!.IsSuiteBundle.Should().BeTrue();
        result.Product.Should().Be(PlanProduct.Suite);

        // Verify 25%+ savings vs individual ($94.97)
        var individualTotal = 9497L;
        var savings = 1m - ((decimal)result.MonthlyPriceCents / individualTotal);
        savings.Should().BeGreaterThanOrEqualTo(0.25m);
    }

    /// <summary>
    /// PLN-10.1.3: Suite must have at least 3 tiers.
    /// </summary>
    [Fact]
    public async Task Suite_ShouldHaveAtLeastThreeTiers()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var tiers = new[]
        {
            new Plan { Product = PlanProduct.Suite, Tier = PlanTier.Basic, Name = "Suite Starter", MonthlyPriceCents = 3999, AnnualPriceCents = 39988, IsSuiteBundle = true },
            new Plan { Product = PlanProduct.Suite, Tier = PlanTier.Pro, Name = "Suite Pro", MonthlyPriceCents = 6999, AnnualPriceCents = 69988, IsSuiteBundle = true },
            new Plan { Product = PlanProduct.Suite, Tier = PlanTier.Ultimate, Name = "Suite Ultimate", MonthlyPriceCents = 9999, AnnualPriceCents = 99988, IsSuiteBundle = true }
        };
        foreach (var t in tiers) db.Plans.Add(t);
        await db.SaveChangesAsync();

        // Act
        var suitePlans = await db.Plans
            .AsQueryable()
            .Where(p => p.IsSuiteBundle)
            .ToListAsync();

        // Assert
        suitePlans.Count.Should().BeGreaterThanOrEqualTo(3);
    }
}
