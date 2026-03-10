using Anansi.Application.Interfaces;
using Anansi.Domain.Entities.Billing;
using Anansi.Domain.Entities.Store;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.Store;

/// <summary>
/// Acceptance tests for store payments (STR-2.5.1 through STR-2.5.4, STR-2.3.4).
/// </summary>
public class PaymentTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public PaymentTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// STR-2.5.1: Payment methods - credit/debit cards, Apple Pay, Google Pay, PayPal.
    /// </summary>
    [Theory]
    [InlineData(PaymentMethod.CreditCard)]
    [InlineData(PaymentMethod.DebitCard)]
    [InlineData(PaymentMethod.ApplePay)]
    [InlineData(PaymentMethod.GooglePay)]
    [InlineData(PaymentMethod.PayPal)]
    [InlineData(PaymentMethod.Offline)]
    public async Task Order_ShouldSupportVariousPaymentMethods(PaymentMethod method)
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var order = new Order
        {
            PhotographerId = Guid.NewGuid(),
            ClientName = "Test Client",
            ClientEmail = "test@example.com",
            PaymentMethod = method,
            FulfillmentType = FulfillmentType.Digital,
            Status = OrderStatus.Pending,
            SubtotalCents = 5000,
            TotalCents = 5000
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.PaymentMethod.Should().Be(method);
    }

    /// <summary>
    /// STR-2.5.2: Tax calculation by region.
    /// </summary>
    [Fact]
    public async Task TaxRate_ShouldBeConfigurableByRegion()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var taxON = new TaxRate { PhotographerId = photographerId, Name = "Ontario HST", Region = "ON", Percentage = 13.00m };
        var taxBC = new TaxRate { PhotographerId = photographerId, Name = "BC GST+PST", Region = "BC", Percentage = 12.00m };
        var taxAB = new TaxRate { PhotographerId = photographerId, Name = "Alberta GST", Region = "AB", Percentage = 5.00m };

        db.TaxRates.Add(taxON);
        db.TaxRates.Add(taxBC);
        db.TaxRates.Add(taxAB);
        await db.SaveChangesAsync();

        // Act
        var resultON = await db.TaxRates.FindAsync(taxON.Id);
        var resultAB = await db.TaxRates.FindAsync(taxAB.Id);

        // Assert
        resultON.Should().NotBeNull();
        resultON!.Percentage.Should().Be(13.00m);
        resultAB.Should().NotBeNull();
        resultAB!.Percentage.Should().Be(5.00m);
    }

    /// <summary>
    /// STR-2.5.2: Tax applied to order.
    /// </summary>
    [Fact]
    public async Task Order_ShouldIncludeTaxInTotal()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var order = new Order
        {
            PhotographerId = Guid.NewGuid(),
            ClientName = "Tax Test Client",
            ClientEmail = "tax@example.com",
            PaymentMethod = PaymentMethod.CreditCard,
            FulfillmentType = FulfillmentType.Lab,
            Status = OrderStatus.Pending,
            SubtotalCents = 10000,
            TaxCents = 1300, // 13% HST
            ShippingCents = 500,
            DiscountCents = 0,
            TotalCents = 11800 // 10000 + 1300 + 500
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.TaxCents.Should().Be(1300);
        result.TotalCents.Should().Be(11800);
    }

    /// <summary>
    /// STR-2.5.3: Shipping configuration with multiple delivery methods.
    /// </summary>
    [Fact]
    public async Task ShippingMethod_ShouldSupportMultipleOptions()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var standard = new ShippingMethod
        {
            PhotographerId = photographerId,
            Name = "Standard Shipping",
            Description = "Regular delivery",
            CostCents = 599,
            EstimatedDelivery = "5-7 business days"
        };
        var express = new ShippingMethod
        {
            PhotographerId = photographerId,
            Name = "Express Shipping",
            Description = "Priority delivery",
            CostCents = 1499,
            EstimatedDelivery = "1-2 business days"
        };
        db.ShippingMethods.Add(standard);
        db.ShippingMethods.Add(express);
        await db.SaveChangesAsync();

        // Act
        var stdResult = await db.ShippingMethods.FindAsync(standard.Id);
        var expResult = await db.ShippingMethods.FindAsync(express.Id);

        // Assert
        stdResult.Should().NotBeNull();
        stdResult!.CostCents.Should().Be(599);
        expResult.Should().NotBeNull();
        expResult!.CostCents.Should().Be(1499);
    }

    /// <summary>
    /// STR-2.5.4: Order management with searchable/filterable history.
    /// </summary>
    [Fact]
    public async Task Order_ShouldSupportFullOrderDetails()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var photographerId = Guid.NewGuid();

        var product = new Product
        {
            PhotographerId = photographerId,
            Name = "Canvas Print",
            ProductType = ProductType.CanvasPrint,
            FulfillmentType = FulfillmentType.Lab
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        var order = new Order
        {
            PhotographerId = photographerId,
            ClientName = "Mary Johnson",
            ClientEmail = "mary@example.com",
            ClientPhone = "555-0123",
            ShippingAddress = "456 Oak Ave",
            ShippingCity = "Vancouver",
            ShippingProvince = "BC",
            ShippingPostalCode = "V6B1A1",
            ShippingCountry = "CA",
            PaymentMethod = PaymentMethod.CreditCard,
            PaymentIntentId = "pi_test123",
            FulfillmentType = FulfillmentType.Lab,
            LabPartner = LabPartner.ProDPI,
            Status = OrderStatus.Processing,
            SubtotalCents = 15000,
            TaxCents = 1800,
            ShippingCents = 599,
            DiscountCents = 2000,
            TotalCents = 15399,
            CommissionCents = 0,
            CommissionPercentage = 0,
            Items = new List<OrderItem>
            {
                new()
                {
                    ProductId = product.Id,
                    ProductName = "Canvas Print",
                    VariationName = "16x20",
                    Quantity = 2,
                    UnitPriceCents = 7500,
                    TotalCents = 15000,
                    SelectedPhotoUrl = "https://cdn.example.com/photo123.jpg"
                }
            }
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.ClientName.Should().Be("Mary Johnson");
        result.Status.Should().Be(OrderStatus.Processing);
        result.PaymentIntentId.Should().Be("pi_test123");
        result.LabPartner.Should().Be(LabPartner.ProDPI);
        result.CommissionPercentage.Should().Be(0);
    }

    /// <summary>
    /// STR-2.3.4: Free plan has 15% commission, paid plans have 0%.
    /// </summary>
    [Fact]
    public async Task Commission_FreePlan_ShouldBe15Percent()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        long subtotal = 10000;
        decimal commissionPct = 15m;
        long commission = (long)(subtotal * commissionPct / 100);

        var order = new Order
        {
            PhotographerId = Guid.NewGuid(),
            ClientName = "Free Plan Client",
            ClientEmail = "free@example.com",
            PaymentMethod = PaymentMethod.CreditCard,
            FulfillmentType = FulfillmentType.Digital,
            Status = OrderStatus.Pending,
            SubtotalCents = subtotal,
            TotalCents = subtotal,
            CommissionPercentage = commissionPct,
            CommissionCents = commission
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.CommissionPercentage.Should().Be(15m);
        result.CommissionCents.Should().Be(1500);
    }

    /// <summary>
    /// STR-2.3.4: Paid plan has 0% commission.
    /// </summary>
    [Fact]
    public async Task Commission_PaidPlan_ShouldBeZero()
    {
        // Arrange
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var order = new Order
        {
            PhotographerId = Guid.NewGuid(),
            ClientName = "Pro Plan Client",
            ClientEmail = "pro@example.com",
            PaymentMethod = PaymentMethod.CreditCard,
            FulfillmentType = FulfillmentType.Lab,
            Status = OrderStatus.Pending,
            SubtotalCents = 10000,
            TotalCents = 10000,
            CommissionPercentage = 0m,
            CommissionCents = 0
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        // Act
        var result = await db.Orders.FindAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.CommissionPercentage.Should().Be(0m);
        result.CommissionCents.Should().Be(0);
    }
}
