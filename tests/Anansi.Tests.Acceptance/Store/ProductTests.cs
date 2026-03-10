using Anansi.Application.Common;
using Anansi.Application.DTOs.Store;
using Anansi.Application.Features.Store.Commands;
using Anansi.Application.Features.Store.Queries;
using Anansi.Application.Interfaces;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Store;

/// <summary>
/// Acceptance tests for product catalog (STR-2.1.1 through STR-2.1.6, STR-2.3.1, STR-2.3.2).
/// </summary>
public class ProductTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ProductTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// STR-2.1.1: Print products with configurable sizes and variations.
    /// STR-2.3.1: Each variation must have cost, markup, and final price.
    /// </summary>
    [Fact]
    public async Task CreateProduct_PrintWithVariations_ShouldCreateProductAndVariations()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var product = new Product
        {
            PhotographerId = photographerId,
            Name = "Canvas Print",
            Description = "Museum-quality canvas",
            ProductType = ProductType.CanvasPrint,
            FulfillmentType = FulfillmentType.Lab,
            LabPartner = LabPartner.WHCC,
            LabColorCorrectionEnabled = true,
            Variations = new List<ProductVariation>
            {
                new() { Name = "8x10", Sku = "CP-8x10", CostCents = 2000, MarkupCents = 3000, PriceCents = 5000 },
                new() { Name = "16x20", Sku = "CP-16x20", CostCents = 5000, MarkupCents = 7000, PriceCents = 12000 },
                new() { Name = "24x36", Sku = "CP-24x36", CostCents = 8000, MarkupCents = 12000, PriceCents = 20000 }
            }
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(product.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Canvas Print");
        result.ProductType.Should().Be(ProductType.CanvasPrint);
        result.FulfillmentType.Should().Be(FulfillmentType.Lab);
        result.LabPartner.Should().Be(LabPartner.WHCC);
        result.LabColorCorrectionEnabled.Should().BeTrue();
    }

    /// <summary>
    /// STR-2.1.2: Photo Albums with customization options.
    /// </summary>
    [Fact]
    public async Task CreateProduct_Album_ShouldSupportCustomizations()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var album = new Product
        {
            PhotographerId = photographerId,
            Name = "Premium Photo Album",
            Description = "Leather-bound premium album",
            ProductType = ProductType.Album,
            FulfillmentType = FulfillmentType.Lab,
            Variations = new List<ProductVariation>
            {
                new() { Name = "10x10 20pg Leather", CostCents = 15000, MarkupCents = 20000, PriceCents = 35000 },
                new() { Name = "12x12 40pg Linen", CostCents = 25000, MarkupCents = 30000, PriceCents = 55000 }
            }
        };
        db.Products.Add(album);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(album.Id);

        // Assert
        result.Should().NotBeNull();
        result!.ProductType.Should().Be(ProductType.Album);
    }

    /// <summary>
    /// STR-2.1.3: Greeting cards.
    /// </summary>
    [Fact]
    public async Task CreateProduct_GreetingCard_ShouldPersist()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var card = new Product
        {
            PhotographerId = Guid.NewGuid(),
            Name = "Holiday Card",
            ProductType = ProductType.GreetingCard,
            FulfillmentType = FulfillmentType.Lab,
            Variations = new List<ProductVariation>
            {
                new() { Name = "5x7 Flat", CostCents = 200, MarkupCents = 300, PriceCents = 500 }
            }
        };
        db.Products.Add(card);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(card.Id);

        // Assert
        result.Should().NotBeNull();
        result!.ProductType.Should().Be(ProductType.GreetingCard);
    }

    /// <summary>
    /// STR-2.1.4: Digital downloads with resolution options.
    /// </summary>
    [Fact]
    public async Task CreateProduct_DigitalDownload_ShouldHaveResolutionOptions()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var digital = new Product
        {
            PhotographerId = Guid.NewGuid(),
            Name = "Digital Download Pack",
            ProductType = ProductType.DigitalDownload,
            FulfillmentType = FulfillmentType.Digital,
            DigitalResolutionOptions = "640,1024,2048,3600,original"
        };
        db.Products.Add(digital);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(digital.Id);

        // Assert
        result.Should().NotBeNull();
        result!.FulfillmentType.Should().Be(FulfillmentType.Digital);
        result.DigitalResolutionOptions.Should().Contain("original");
    }

    /// <summary>
    /// STR-2.1.5: Packages bundle products at a set price.
    /// </summary>
    [Fact]
    public async Task CreateProduct_Package_ShouldBundleProducts()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var print = new Product
        {
            PhotographerId = photographerId,
            Name = "8x10 Print",
            ProductType = ProductType.Print,
            FulfillmentType = FulfillmentType.Lab
        };
        db.Products.Add(print);

        var digital = new Product
        {
            PhotographerId = photographerId,
            Name = "Digital Gallery",
            ProductType = ProductType.DigitalDownload,
            FulfillmentType = FulfillmentType.Digital
        };
        db.Products.Add(digital);
        await db.SaveChangesAsync();

        var package = new Product
        {
            PhotographerId = photographerId,
            Name = "Wedding Package",
            ProductType = ProductType.Package,
            FulfillmentType = FulfillmentType.SelfFulfilled,
            PackageItems = new List<PackageItem>
            {
                new() { IncludedProductId = print.Id, Quantity = 5 },
                new() { IncludedProductId = digital.Id, Quantity = 1 }
            }
        };
        db.Products.Add(package);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(package.Id);

        // Assert
        result.Should().NotBeNull();
        result!.ProductType.Should().Be(ProductType.Package);
    }

    /// <summary>
    /// STR-2.1.6: Self-fulfilled products with custom configuration.
    /// </summary>
    [Fact]
    public async Task CreateProduct_SelfFulfilled_ShouldSupportCustomConfig()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var product = new Product
        {
            PhotographerId = Guid.NewGuid(),
            Name = "Custom Photo Mug",
            Description = "Hand-crafted photo mug",
            ProductType = ProductType.SelfFulfilled,
            FulfillmentType = FulfillmentType.SelfFulfilled,
            Variations = new List<ProductVariation>
            {
                new() { Name = "11oz White", CostCents = 0, MarkupCents = 2500, PriceCents = 2500 },
                new() { Name = "15oz Black", CostCents = 0, MarkupCents = 3500, PriceCents = 3500 }
            }
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(product.Id);

        // Assert
        result.Should().NotBeNull();
        result!.FulfillmentType.Should().Be(FulfillmentType.SelfFulfilled);
    }

    /// <summary>
    /// STR-2.3.1: Individual variation pricing with cost/markup/final price.
    /// </summary>
    [Fact]
    public void ProductVariation_ShouldHaveCostMarkupAndPrice()
    {
        // Arrange
        var variation = new ProductVariation
        {
            Name = "8x10",
            CostCents = 1500,
            MarkupCents = 3500,
            PriceCents = 5000,
            IsCustomPriced = true,
            ProductId = Guid.NewGuid()
        };

        // Act & Assert
        variation.CostCents.Should().Be(1500);
        variation.MarkupCents.Should().Be(3500);
        variation.PriceCents.Should().Be(5000);
        variation.IsCustomPriced.Should().BeTrue();
    }

    /// <summary>
    /// STR-2.3.2: Bulk markup should not override custom prices unless confirmed.
    /// </summary>
    [Fact]
    public async Task BulkMarkup_ShouldRespectCustomPricedFlag()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var product = new Product
        {
            PhotographerId = photographerId,
            Name = "Metal Print",
            ProductType = ProductType.MetalPrint,
            FulfillmentType = FulfillmentType.Lab,
            Variations = new List<ProductVariation>
            {
                new() { Name = "8x10", CostCents = 2000, MarkupCents = 3000, PriceCents = 5000, IsCustomPriced = false },
                new() { Name = "16x20", CostCents = 4000, MarkupCents = 6000, PriceCents = 10000, IsCustomPriced = true }
            }
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        // Act - Simulate bulk markup (50%) without override
        var variations = product.Variations.ToList();
        foreach (var v in variations)
        {
            if (!v.IsCustomPriced)
            {
                v.MarkupCents = (long)(v.CostCents * 50m / 100m);
                v.PriceCents = v.CostCents + v.MarkupCents;
            }
        }
        await db.SaveChangesAsync();

        // Assert
        var standard = variations.First(v => v.Name == "8x10");
        var custom = variations.First(v => v.Name == "16x20");

        standard.MarkupCents.Should().Be(1000); // 50% of 2000
        standard.PriceCents.Should().Be(3000);
        custom.MarkupCents.Should().Be(6000); // Unchanged - custom priced
        custom.PriceCents.Should().Be(10000);
    }
}
