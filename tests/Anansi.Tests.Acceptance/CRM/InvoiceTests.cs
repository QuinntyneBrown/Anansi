using Anansi.Application.Features.CRM.Invoices;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for INV-4.5.1 through INV-4.5.7.
/// </summary>
public class InvoiceTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public InvoiceTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// INV-4.5.1: Invoice builder with line items and auto-calculated totals.
    /// INV-4.5.5: Tax support.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_CalculatesTotal_WithTax()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var lineItems = new List<CreateInvoiceLineItemInput>
        {
            new("Wedding Coverage", "8 hours", 1, 350000, 0),
            new("Album", "12x12 flush mount", 1, 80000, 1)
        };

        // Act
        var handler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInvoiceCommand("Wedding Invoice", null, null, DateTime.UtcNow.AddDays(30),
                13m, 0, true, null, false, null, false, null, null, null, null, lineItems, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.SubtotalCents.Should().Be(430000);
        result.Value.TaxRatePercent.Should().Be(13m);
        result.Value.TaxAmountCents.Should().Be(55900); // 13% of 430000
        result.Value.TotalCents.Should().Be(485900);
        result.Value.LineItems.Count.Should().Be(2);
        result.Value.TipsEnabled.Should().BeTrue();
    }

    /// <summary>
    /// INV-4.5.2: Payment schedules with individual installments.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_WithPaymentSchedules()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var lineItems = new List<CreateInvoiceLineItemInput> { new("Service", null, 1, 100000, 0) };
        var schedules = new List<CreatePaymentScheduleInput>
        {
            new("First Installment", 50000, DateTime.UtcNow.AddDays(7), 0),
            new("Second Installment", 50000, DateTime.UtcNow.AddDays(30), 1)
        };

        // Act
        var handler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInvoiceCommand("Installment Invoice", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null, lineItems, schedules),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.PaymentSchedules.Count.Should().Be(2);
        result.Value.PaymentSchedules[0].Label.Should().Be("First Installment");
        result.Value.PaymentSchedules[1].AmountCents.Should().Be(50000);
    }

    /// <summary>
    /// INV-4.5.3: Deposit/retainer auto-creates two installments.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_WithDeposit_AutoSplits()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var lineItems = new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 200000, 0) };

        // Act
        var handler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInvoiceCommand("Deposit Invoice", null, null, null, 0, 0, false, 50000, false, null, false, null, null, null, null, lineItems, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.PaymentSchedules.Count.Should().Be(2);
        result.Value.PaymentSchedules[0].Label.Should().Be("Deposit");
        result.Value.PaymentSchedules[0].AmountCents.Should().Be(50000);
        result.Value.PaymentSchedules[1].Label.Should().Be("Remaining Balance");
        result.Value.PaymentSchedules[1].AmountCents.Should().Be(150000);
    }

    /// <summary>
    /// INV-4.5.7: Invoice templates.
    /// </summary>
    [Fact]
    public async Task CreateInvoiceTemplate_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var lineItems = new List<CreateInvoiceLineItemInput> { new("Standard Package", null, 1, 100000, 0) };

        // Act
        var handler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInvoiceCommand("Template Invoice", null, null, null, 0, 0, false, null, false, null, true, "Standard Template", null, null, null, lineItems, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsTemplate.Should().BeTrue();
        result.Value.TemplateName.Should().Be("Standard Template");
    }
}
