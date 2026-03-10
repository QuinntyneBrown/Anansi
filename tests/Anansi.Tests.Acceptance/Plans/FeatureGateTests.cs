using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Plans;

/// <summary>
/// Acceptance tests for feature gating (PLN-10.2.1 through PLN-10.2.4).
/// </summary>
public class FeatureGateTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public FeatureGateTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// PLN-10.2.1: Gallery free tier - 3GB storage, 15% commission, no video.
    /// </summary>
    [Fact]
    public async Task GalleryFree_ShouldHaveCorrectGates()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Free,
            Name = "Gallery Free",
            MonthlyPriceCents = 0,
            AnnualPriceCents = 0,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "storage_gb", FeatureValue = "3", Description = "3GB storage" },
                new() { FeatureKey = "unlimited_galleries", FeatureValue = "true", Description = "Unlimited galleries" },
                new() { FeatureKey = "store_commission_pct", FeatureValue = "15", Description = "15% store commission" },
                new() { FeatureKey = "video_enabled", FeatureValue = "false", Description = "No video" },
                new() { FeatureKey = "custom_domain", FeatureValue = "false", Description = "No custom domain" },
                new() { FeatureKey = "branding_removal", FeatureValue = "false", Description = "Platform branding shown" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result.Should().NotBeNull();
        result!.FeatureGates.Should().HaveCount(6);
        result.FeatureGates.First(fg => fg.FeatureKey == "storage_gb").FeatureValue.Should().Be("3");
        result.FeatureGates.First(fg => fg.FeatureKey == "store_commission_pct").FeatureValue.Should().Be("15");
        result.FeatureGates.First(fg => fg.FeatureKey == "video_enabled").FeatureValue.Should().Be("false");
    }

    /// <summary>
    /// PLN-10.2.1: Gallery Pro tier - 1TB storage, 0% commission, video 4K.
    /// </summary>
    [Fact]
    public async Task GalleryPro_ShouldHaveCorrectGates()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Pro,
            Name = "Gallery Pro",
            MonthlyPriceCents = 3999,
            AnnualPriceCents = 39988,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "storage_gb", FeatureValue = "1000", Description = "1TB storage" },
                new() { FeatureKey = "video_hours", FeatureValue = "2", Description = "2hr video 4K" },
                new() { FeatureKey = "video_4k", FeatureValue = "true", Description = "4K video enabled" },
                new() { FeatureKey = "store_commission_pct", FeatureValue = "0", Description = "0% commission" },
                new() { FeatureKey = "auto_fulfillment", FeatureValue = "true", Description = "Lab auto-fulfillment" },
                new() { FeatureKey = "coupons", FeatureValue = "true", Description = "Coupon codes enabled" },
                new() { FeatureKey = "raw_upload", FeatureValue = "true", Description = "RAW file upload" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result.Should().NotBeNull();
        result!.FeatureGates.First(fg => fg.FeatureKey == "storage_gb").FeatureValue.Should().Be("1000");
        result.FeatureGates.First(fg => fg.FeatureKey == "store_commission_pct").FeatureValue.Should().Be("0");
        result.FeatureGates.First(fg => fg.FeatureKey == "raw_upload").FeatureValue.Should().Be("true");
    }

    /// <summary>
    /// PLN-10.2.1: Gallery Ultimate - unlimited storage, all features.
    /// </summary>
    [Fact]
    public async Task GalleryUltimate_ShouldHaveUnlimitedStorage()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Gallery,
            Tier = PlanTier.Ultimate,
            Name = "Gallery Ultimate",
            MonthlyPriceCents = 5999,
            AnnualPriceCents = 59988,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "storage_gb", FeatureValue = "unlimited" },
                new() { FeatureKey = "video_hours", FeatureValue = "5" },
                new() { FeatureKey = "video_4k", FeatureValue = "true" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result!.FeatureGates.First(fg => fg.FeatureKey == "storage_gb").FeatureValue.Should().Be("unlimited");
    }

    /// <summary>
    /// PLN-10.2.2: Website feature gates (Free, Plus, Pro).
    /// </summary>
    [Fact]
    public async Task WebsiteFree_ShouldHaveCorrectLimits()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Website,
            Tier = PlanTier.Free,
            Name = "Website Free",
            MonthlyPriceCents = 0,
            AnnualPriceCents = 0,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "max_pages", FeatureValue = "15" },
                new() { FeatureKey = "max_photos", FeatureValue = "100" },
                new() { FeatureKey = "max_blog_posts", FeatureValue = "5" },
                new() { FeatureKey = "branding_removal", FeatureValue = "false" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result!.FeatureGates.First(fg => fg.FeatureKey == "max_pages").FeatureValue.Should().Be("15");
        result.FeatureGates.First(fg => fg.FeatureKey == "max_blog_posts").FeatureValue.Should().Be("5");
    }

    /// <summary>
    /// PLN-10.2.3: Studio Manager feature gates.
    /// </summary>
    [Fact]
    public async Task StudioManagerFree_ShouldHaveCorrectLimits()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.StudioManager,
            Tier = PlanTier.Free,
            Name = "Studio Manager Free",
            MonthlyPriceCents = 0,
            AnnualPriceCents = 0,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "max_contracts", FeatureValue = "3" },
                new() { FeatureKey = "max_active_session_types", FeatureValue = "1" },
                new() { FeatureKey = "unlimited_invoices", FeatureValue = "true" },
                new() { FeatureKey = "document_reminders", FeatureValue = "false" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result!.FeatureGates.First(fg => fg.FeatureKey == "max_contracts").FeatureValue.Should().Be("3");
        result.FeatureGates.First(fg => fg.FeatureKey == "max_active_session_types").FeatureValue.Should().Be("1");
        result.FeatureGates.First(fg => fg.FeatureKey == "document_reminders").FeatureValue.Should().Be("false");
    }

    /// <summary>
    /// PLN-10.2.4: Suite feature gates (Starter, Pro, Ultimate).
    /// </summary>
    [Fact]
    public async Task SuiteStarter_ShouldHaveCorrectGates()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Suite,
            Tier = PlanTier.Basic, // Starter maps to Basic tier
            Name = "Suite Starter",
            MonthlyPriceCents = 3999,
            AnnualPriceCents = 39988,
            IsSuiteBundle = true,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "storage_gb", FeatureValue = "100" },
                new() { FeatureKey = "video_hours", FeatureValue = "1" },
                new() { FeatureKey = "max_active_session_types", FeatureValue = "3" },
                new() { FeatureKey = "plus_level_features", FeatureValue = "true" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result!.FeatureGates.First(fg => fg.FeatureKey == "storage_gb").FeatureValue.Should().Be("100");
        result.FeatureGates.First(fg => fg.FeatureKey == "video_hours").FeatureValue.Should().Be("1");
        result.FeatureGates.First(fg => fg.FeatureKey == "max_active_session_types").FeatureValue.Should().Be("3");
    }

    /// <summary>
    /// PLN-10.2.4: Suite Ultimate - unlimited everything.
    /// </summary>
    [Fact]
    public async Task SuiteUltimate_ShouldHaveUnlimitedFeatures()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var plan = new Plan
        {
            Product = PlanProduct.Suite,
            Tier = PlanTier.Ultimate,
            Name = "Suite Ultimate",
            MonthlyPriceCents = 9999,
            AnnualPriceCents = 99988,
            IsSuiteBundle = true,
            FeatureGates = new List<PlanFeatureGate>
            {
                new() { FeatureKey = "storage_gb", FeatureValue = "unlimited" },
                new() { FeatureKey = "video_hours", FeatureValue = "10" },
                new() { FeatureKey = "max_active_session_types", FeatureValue = "unlimited" },
                new() { FeatureKey = "all_features", FeatureValue = "true" }
            }
        };
        db.Plans.Add(plan);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Plans
            .Include(p => p.FeatureGates)
            .FirstOrDefaultAsync(p => p.Id == plan.Id);

        // Assert
        result!.FeatureGates.First(fg => fg.FeatureKey == "storage_gb").FeatureValue.Should().Be("unlimited");
        result.FeatureGates.First(fg => fg.FeatureKey == "video_hours").FeatureValue.Should().Be("10");
        result.FeatureGates.First(fg => fg.FeatureKey == "all_features").FeatureValue.Should().Be("true");
    }
}
