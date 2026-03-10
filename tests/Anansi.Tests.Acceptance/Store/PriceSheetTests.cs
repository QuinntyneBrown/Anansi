using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Store;

/// <summary>
/// Acceptance tests for price sheets (STR-2.3.3).
/// </summary>
public class PriceSheetTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public PriceSheetTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// STR-2.3.3: Price sheets can be assigned to collections.
    /// </summary>
    [Fact]
    public async Task CreatePriceSheet_ShouldPersistWithItems()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var variation = new ProductVariation
        {
            Name = "8x10 Print",
            CostCents = 1000,
            MarkupCents = 2000,
            PriceCents = 3000,
            Product = new Product
            {
                PhotographerId = photographerId,
                Name = "Print",
                ProductType = Domain.Enums.ProductType.Print,
                FulfillmentType = Domain.Enums.FulfillmentType.Lab
            }
        };
        db.ProductVariations.Add(variation);
        await db.SaveChangesAsync();

        var sheet = new PriceSheet
        {
            PhotographerId = photographerId,
            Name = "Wedding Price Sheet",
            Description = "Prices for wedding clients",
            IsDownloadOnly = false,
            IsDefault = true,
            Items = new List<PriceSheetItem>
            {
                new() { ProductVariationId = variation.Id, PriceCents = 3500 }
            }
        };
        db.PriceSheets.Add(sheet);
        await db.SaveChangesAsync();

        // Act
        var result = await db.PriceSheets
            .Include(ps => ps.Items)
            .FirstOrDefaultAsync(ps => ps.Id == sheet.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Wedding Price Sheet");
        result.IsDefault.Should().BeTrue();
        result.Items.Should().HaveCount(1);
        result.Items.First().PriceCents.Should().Be(3500);
    }

    /// <summary>
    /// STR-2.3.3: Download-only price sheets.
    /// </summary>
    [Fact]
    public async Task CreatePriceSheet_DownloadOnly_ShouldWork()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var sheet = new PriceSheet
        {
            PhotographerId = Guid.NewGuid(),
            Name = "Digital Only Sheet",
            IsDownloadOnly = true,
            IsDefault = false
        };
        db.PriceSheets.Add(sheet);
        await db.SaveChangesAsync();

        // Act
        var result = await db.PriceSheets.FindAsync(sheet.Id);

        // Assert
        result.Should().NotBeNull();
        result!.IsDownloadOnly.Should().BeTrue();
    }
}
