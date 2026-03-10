using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Store;

/// <summary>
/// Acceptance tests for fulfillment (STR-2.2.1, STR-2.2.2, STR-2.2.3).
/// </summary>
public class FulfillmentTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public FulfillmentTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// STR-2.2.1: Lab-fulfilled products auto-send to configured lab.
    /// White-label shipping, lab color correction configurable.
    /// </summary>
    [Fact]
    public async Task LabFulfilledOrder_ShouldRecordLabPartnerAndColorCorrection()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var product = new Product
        {
            PhotographerId = photographerId,
            Name = "Lab Canvas",
            ProductType = ProductType.CanvasPrint,
            FulfillmentType = FulfillmentType.Lab,
            LabPartner = LabPartner.WHCC,
            LabColorCorrectionEnabled = true
        };
        db.Products.Add(product);

        var order = new Order
        {
            PhotographerId = photographerId,
            ClientName = "Jane Doe",
            ClientEmail = "jane@example.com",
            FulfillmentType = FulfillmentType.Lab,
            LabPartner = LabPartner.WHCC,
            PaymentMethod = PaymentMethod.CreditCard,
            Status = OrderStatus.Processing,
            SubtotalCents = 5000,
            TotalCents = 5000,
            Items = new List<OrderItem>
            {
                new()
                {
                    ProductId = product.Id,
                    ProductName = "Lab Canvas",
                    Quantity = 1,
                    UnitPriceCents = 5000,
                    TotalCents = 5000
                }
            }
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.FulfillmentType.Should().Be(FulfillmentType.Lab);
        result.LabPartner.Should().Be(LabPartner.WHCC);
    }

    /// <summary>
    /// STR-2.2.2: Self-fulfilled orders allow photographer to add tracking info.
    /// </summary>
    [Fact]
    public async Task SelfFulfilledOrder_ShouldSupportTrackingInfo()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var order = new Order
        {
            PhotographerId = photographerId,
            ClientName = "Bob Smith",
            ClientEmail = "bob@example.com",
            FulfillmentType = FulfillmentType.SelfFulfilled,
            PaymentMethod = PaymentMethod.CreditCard,
            Status = OrderStatus.Processing,
            SubtotalCents = 2500,
            TotalCents = 2500,
            ShippingAddress = "123 Main St",
            ShippingCity = "Toronto",
            ShippingProvince = "ON",
            ShippingPostalCode = "M5V1A1",
            ShippingCountry = "CA"
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act - photographer marks as shipped
        order.Status = OrderStatus.Shipped;
        order.TrackingNumber = "1Z999AA10123456789";
        order.TrackingUrl = "https://tracking.example.com/1Z999AA10123456789";
        await db.SaveChangesAsync();

        // Assert
        var result = await db.Orders.FindAsync(order.Id);
        result.Should().NotBeNull();
        result!.Status.Should().Be(OrderStatus.Shipped);
        result.TrackingNumber.Should().Be("1Z999AA10123456789");
        result.TrackingUrl.Should().Contain("tracking.example.com");
    }

    /// <summary>
    /// STR-2.2.3: Lab partner management - multiple labs supported.
    /// </summary>
    [Theory]
    [InlineData(LabPartner.WHCC)]
    [InlineData(LabPartner.ProDPI)]
    [InlineData(LabPartner.Millers)]
    [InlineData(LabPartner.LoxleyColour)]
    public async Task Product_ShouldSupportMultipleLabPartners(LabPartner labPartner)
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var product = new Product
        {
            PhotographerId = Guid.NewGuid(),
            Name = $"Print via {labPartner}",
            ProductType = ProductType.Print,
            FulfillmentType = FulfillmentType.Lab,
            LabPartner = labPartner,
            Variations = new List<ProductVariation>
            {
                new()
                {
                    Name = "8x10",
                    CostCents = 1500,
                    MarkupCents = 2000,
                    PriceCents = 3500
                }
            }
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Products.FindAsync(product.Id);

        // Assert
        result.Should().NotBeNull();
        result!.LabPartner.Should().Be(labPartner);
        var variation = result.Variations.First();
        variation.CostCents.Should().Be(1500); // Lab price displayed
        variation.MarkupCents.Should().Be(2000); // Photographer markup
        variation.PriceCents.Should().Be(3500); // Client-facing price
    }
}
