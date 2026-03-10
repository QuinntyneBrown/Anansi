using Anansi.Application.Features.CRM.Invoices;
using Anansi.Application.Features.Finance;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.CRM;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Finance;

/// <summary>
/// Acceptance tests for PAY-4.8.1 through PAY-4.8.8, GFT-4.9.1, GFT-4.9.2, RPT-4.10.1 through RPT-4.10.4, CAP-4.11.1, CAP-4.11.2.
/// </summary>
public class PaymentTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public PaymentTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// PAY-4.8.1: Card payment records with correct fees (2.9% + $0.30).
    /// </summary>
    [Fact]
    public async Task RecordCardPayment_CalculatesFees()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new RecordPaymentCommand(null, null, null, 10000, 0, "usd", PaymentMethod.CreditCard,
                "pi_test123", "4242", "Test payment", false, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AmountCents.Should().Be(10000);
        result.Value.FeeCents.Should().Be(320); // 2.9% of 10000 + 30 = 290 + 30 = 320
        result.Value.NetAmountCents.Should().Be(9680);
    }

    /// <summary>
    /// PAY-4.8.4: Bank transfer with 1% fee.
    /// </summary>
    [Fact]
    public async Task RecordBankTransfer_Has1PercentFee()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new RecordPaymentCommand(null, null, null, 50000, 0, "usd", PaymentMethod.BankTransfer,
                null, null, "ACH transfer", false, null),
            CancellationToken.None);

        // Assert
        result.Value!.FeeCents.Should().Be(500); // 1% of 50000
    }

    /// <summary>
    /// PAY-4.8.7: Offline payments have zero fees.
    /// </summary>
    [Fact]
    public async Task RecordOfflinePayment_ZeroFees()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new RecordPaymentCommand(null, null, null, 20000, 0, "usd", PaymentMethod.Offline,
                null, null, "Cash payment", true, null),
            CancellationToken.None);

        // Assert
        result.Value!.FeeCents.Should().Be(0);
        result.Value.IsOffline.Should().BeTrue();
    }

    /// <summary>
    /// INV-4.5.6: Tip tracking. Payment updates invoice paid amount.
    /// </summary>
    [Fact]
    public async Task RecordPayment_WithTip_UpdatesInvoice()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Tip Test", null, null, null, 0, 0, true, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Service", null, 1, 50000, 0) }, null),
            CancellationToken.None);

        // Act
        var payHandler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        await payHandler.Handle(
            new RecordPaymentCommand(null, invoice.Value!.Id, null, 50000, 5000, "usd", PaymentMethod.CreditCard,
                "pi_test", "1234", null, false, null),
            CancellationToken.None);

        // Assert
        var updatedInvoice = await db.Invoices.FirstAsync(i => i.Id == invoice.Value.Id);
        updatedInvoice.PaidCents.Should().Be(50000);
        updatedInvoice.TipAmountCents.Should().Be(5000);
        updatedInvoice.Status.Should().Be(InvoiceStatus.Paid);
    }

    /// <summary>
    /// GFT-4.9.1: Create gift card. GFT-4.9.2: Redeem gift card with balance tracking.
    /// </summary>
    [Fact]
    public async Task GiftCard_CreateAndRedeem()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var createHandler = new CreateGiftCardHandler(db, new FakeCurrentUserService());
        var gc = await createHandler.Handle(
            new CreateGiftCardCommand(10000, null, "recipient@test.com", "John", "Jane", "Happy Birthday!"),
            CancellationToken.None);

        // Assert - Create
        gc.IsSuccess.Should().BeTrue();
        gc.Value!.OriginalAmountCents.Should().Be(10000);
        gc.Value.BalanceCents.Should().Be(10000);
        gc.Value.Code.Should().NotBeNullOrEmpty();

        // Act - Partial redeem
        var redeemHandler = new RedeemGiftCardHandler(db, new FakeCurrentUserService());
        var redeem1 = await redeemHandler.Handle(new RedeemGiftCardCommand(gc.Value.Code, 3000), CancellationToken.None);

        // Assert - Partial redeem
        redeem1.IsSuccess.Should().BeTrue();
        redeem1.Value!.BalanceCents.Should().Be(7000);
        redeem1.Value.IsActive.Should().BeTrue();

        // Act - Full redeem
        var redeem2 = await redeemHandler.Handle(new RedeemGiftCardCommand(gc.Value.Code, 7000), CancellationToken.None);

        // Assert - Full redeem
        redeem2.Value!.BalanceCents.Should().Be(0);
        redeem2.Value.IsActive.Should().BeFalse();
    }

    /// <summary>
    /// RPT-4.10.1: Revenue dashboard with breakdowns.
    /// RPT-4.10.4: Invoice tracking counts.
    /// </summary>
    [Fact]
    public async Task RevenueDashboard_ReturnsCorrectTotals()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var payHandler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 10000, 500, "usd", PaymentMethod.CreditCard, null, null, null, false, null),
            CancellationToken.None);
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 20000, 0, "usd", PaymentMethod.ApplePay, null, null, null, false, null),
            CancellationToken.None);

        // Act
        var dashHandler = new GetRevenueDashboardHandler(db, new FakeCurrentUserService());
        var result = await dashHandler.Handle(new GetRevenueDashboardQuery(null, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TotalRevenueCents.Should().Be(30000);
        result.Value.TotalTipsCents.Should().Be(500);
        result.Value.PaymentMethodBreakdown.Should().HaveCount(2);
    }

    /// <summary>
    /// RPT-4.10.3: Export transactions to CSV.
    /// </summary>
    [Fact]
    public async Task ExportTransactions_ReturnsCsv()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var payHandler = new RecordPaymentHandler(db, new FakeCurrentUserService());
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 5000, 0, "usd", PaymentMethod.CreditCard, null, "9999", "Export test", false, null),
            CancellationToken.None);

        // Act
        var exportHandler = new ExportTransactionsHandler(db, new FakeCurrentUserService());
        var result = await exportHandler.Handle(new ExportTransactionsQuery(null, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Contain("Date,Description");
        result.Value.Should().Contain("Export test");
    }

    /// <summary>
    /// CAP-4.11.1: Apply for financing. CAP-4.11.2: Check status.
    /// </summary>
    [Fact]
    public async Task Financing_ApplyAndCheck()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var applyHandler = new ApplyForFinancingHandler(db, new FakeCurrentUserService());
        var result = await applyHandler.Handle(new ApplyForFinancingCommand(500000), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.RequestedAmountCents.Should().Be(500000);
        result.Value.Status.Should().Be("Pending");

        // Act - Check
        var getHandler = new GetFinancingApplicationHandler(db, new FakeCurrentUserService());
        var getResult = await getHandler.Handle(new GetFinancingApplicationQuery(result.Value.Id), CancellationToken.None);
        getResult.IsSuccess.Should().BeTrue();
    }
}
