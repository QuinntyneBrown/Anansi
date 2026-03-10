using Anansi.Application.Features.CRM.Invoices;
using Anansi.Application.Features.Finance;
using Anansi.Application.Features.Tax;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Tax;

internal class TaxFakeCurrentUserService : Application.Interfaces.ICurrentUserService
{
    public string? UserId => "test-user";
    public Guid? PhotographerId => TestHelper.TestPhotographerId;
    public bool IsAuthenticated => true;
}

/// <summary>
/// Acceptance tests for TAX-21.1.1, TAX-21.1.2, TAX-21.2.1, TAX-21.3.1, TAX-21.4.1, TAX-21.4.2.
/// </summary>
public class TaxProfileTests
{
    /// <summary>
    /// TAX-21.1.1: Configure tax profile with HST rate and registration status.
    /// TAX-21.1.2: Retrieve the configured tax profile.
    /// </summary>
    [Fact]
    public async Task ConfigureAndRetrieveTaxProfile()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Act - Create profile
        var updateHandler = new UpdateTaxProfileHandler(db, userService);
        var result = await updateHandler.Handle(
            new UpdateTaxProfileCommand(13m, "RT-0001", HstRegistrationStatus.Voluntary, true),
            CancellationToken.None);

        // Assert - Create
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstRatePercent.Should().Be(13m);
        result.Value.HstRegistrationNumber.Should().Be("RT-0001");
        result.Value.RegistrationStatus.Should().Be(HstRegistrationStatus.Voluntary);
        result.Value.IsHstEnabled.Should().BeTrue();

        // Act - Retrieve
        var getHandler = new GetTaxProfileHandler(db, userService);
        var getResult = await getHandler.Handle(new GetTaxProfileQuery(), CancellationToken.None);

        // Assert - Retrieve
        getResult.IsSuccess.Should().BeTrue();
        getResult.Value!.HstRatePercent.Should().Be(13m);
        getResult.Value.HstRegistrationNumber.Should().Be("RT-0001");
        getResult.Value.RegistrationStatus.Should().Be(HstRegistrationStatus.Voluntary);
        getResult.Value.IsHstEnabled.Should().BeTrue();
    }

    /// <summary>
    /// TAX-21.1.2: Returns defaults when no profile configured.
    /// </summary>
    [Fact]
    public async Task GetTaxProfile_ReturnsDefaults_WhenNotConfigured()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new GetTaxProfileHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(new GetTaxProfileQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstRatePercent.Should().Be(13m);
        result.Value.RegistrationStatus.Should().Be(HstRegistrationStatus.NotRegistered);
        result.Value.IsHstEnabled.Should().BeFalse();
    }

    /// <summary>
    /// TAX-21.1.1: Update existing profile.
    /// </summary>
    [Fact]
    public async Task UpdateTaxProfile_UpdatesExisting()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();
        var handler = new UpdateTaxProfileHandler(db, userService);

        // Create initial
        await handler.Handle(
            new UpdateTaxProfileCommand(13m, "RT-0001", HstRegistrationStatus.Voluntary, true),
            CancellationToken.None);

        // Act - Update
        var result = await handler.Handle(
            new UpdateTaxProfileCommand(15m, "RT-0002", HstRegistrationStatus.Mandatory, true),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstRatePercent.Should().Be(15m);
        result.Value.HstRegistrationNumber.Should().Be("RT-0002");
        result.Value.RegistrationStatus.Should().Be(HstRegistrationStatus.Mandatory);

        // Verify only one profile exists
        var count = await db.TaxProfiles.CountAsync();
        count.Should().Be(1);
    }

    /// <summary>
    /// TAX-21.2.1: Auto-calculate HST on invoice when HST is enabled and TaxRatePercent is 0.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_AutoAppliesHstRate_WhenEnabled()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Enable HST with 13% rate
        var taxHandler = new UpdateTaxProfileHandler(db, userService);
        await taxHandler.Handle(
            new UpdateTaxProfileCommand(13m, "RT-0001", HstRegistrationStatus.Voluntary, true),
            CancellationToken.None);

        // Act - Create invoice with TaxRatePercent = 0 (should auto-apply 13%)
        var invoiceHandler = new CreateInvoiceHandler(db, userService);
        var result = await invoiceHandler.Handle(
            new CreateInvoiceCommand("HST Test Invoice", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Photography Session", null, 1, 100000, 0) }, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TaxRatePercent.Should().Be(13m);
        result.Value.TaxAmountCents.Should().Be(13000); // 13% of $1000 = $130
        result.Value.TotalCents.Should().Be(113000); // $1000 + $130
    }

    /// <summary>
    /// TAX-21.2.1: Explicit tax rate takes precedence over HST profile.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_ExplicitTaxRate_OverridesHstProfile()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Enable HST with 13% rate
        var taxHandler = new UpdateTaxProfileHandler(db, userService);
        await taxHandler.Handle(
            new UpdateTaxProfileCommand(13m, null, HstRegistrationStatus.Voluntary, true),
            CancellationToken.None);

        // Act - Create invoice with explicit 5% tax rate
        var invoiceHandler = new CreateInvoiceHandler(db, userService);
        var result = await invoiceHandler.Handle(
            new CreateInvoiceCommand("GST Invoice", null, null, null, 5m, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Service", null, 1, 100000, 0) }, null),
            CancellationToken.None);

        // Assert - Explicit 5% overrides the 13% profile
        result.IsSuccess.Should().BeTrue();
        result.Value!.TaxRatePercent.Should().Be(5m);
        result.Value.TaxAmountCents.Should().Be(5000);
    }

    /// <summary>
    /// TAX-21.2.1: No HST when profile is not enabled.
    /// </summary>
    [Fact]
    public async Task CreateInvoice_NoHst_WhenProfileDisabled()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Configure but disable HST
        var taxHandler = new UpdateTaxProfileHandler(db, userService);
        await taxHandler.Handle(
            new UpdateTaxProfileCommand(13m, null, HstRegistrationStatus.NotRegistered, false),
            CancellationToken.None);

        // Act - Create invoice with TaxRatePercent = 0
        var invoiceHandler = new CreateInvoiceHandler(db, userService);
        var result = await invoiceHandler.Handle(
            new CreateInvoiceCommand("No Tax Invoice", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Service", null, 1, 100000, 0) }, null),
            CancellationToken.None);

        // Assert - No tax applied
        result.IsSuccess.Should().BeTrue();
        result.Value!.TaxRatePercent.Should().Be(0);
        result.Value.TaxAmountCents.Should().Be(0);
    }

    /// <summary>
    /// TAX-21.3.1: Get revenue threshold status with rolling 4-quarter breakdown.
    /// </summary>
    [Fact]
    public async Task GetThresholdStatus_CalculatesRollingRevenue()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Add payments spread across current quarter
        var payHandler = new RecordPaymentHandler(db, userService);
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 1000000, 0, "cad", PaymentMethod.CreditCard,
                null, null, "Payment 1", false, null),
            CancellationToken.None);
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 500000, 0, "cad", PaymentMethod.CreditCard,
                null, null, "Payment 2", false, null),
            CancellationToken.None);

        // Act
        var handler = new GetThresholdStatusHandler(db, userService);
        var result = await handler.Handle(new GetThresholdStatusQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.RollingRevenueCents.Should().Be(1500000); // $15,000
        result.Value.ThresholdPercentage.Should().Be(50m); // 50% of $30,000
        result.Value.AlertLevel.Should().Be(ThresholdAlertLevel.None);
        result.Value.QuarterlyBreakdown.Should().HaveCount(4);
    }

    /// <summary>
    /// TAX-21.3.1: Warning alert when revenue reaches 75%.
    /// </summary>
    [Fact]
    public async Task GetThresholdStatus_WarningAlert_At75Percent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Add $22,500 in payments (75% of $30,000)
        var payHandler = new RecordPaymentHandler(db, userService);
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 2250000, 0, "cad", PaymentMethod.CreditCard,
                null, null, "Large payment", false, null),
            CancellationToken.None);

        // Act
        var handler = new GetThresholdStatusHandler(db, userService);
        var result = await handler.Handle(new GetThresholdStatusQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AlertLevel.Should().Be(ThresholdAlertLevel.Warning);
        result.Value.ThresholdPercentage.Should().Be(75m);
    }

    /// <summary>
    /// TAX-21.3.1: Critical alert when revenue reaches 90%.
    /// </summary>
    [Fact]
    public async Task GetThresholdStatus_CriticalAlert_At90Percent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Add $27,000 in payments (90% of $30,000)
        var payHandler = new RecordPaymentHandler(db, new TaxFakeCurrentUserService());
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 2700000, 0, "cad", PaymentMethod.CreditCard,
                null, null, "Big payment", false, null),
            CancellationToken.None);

        // Act
        var handler = new GetThresholdStatusHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(new GetThresholdStatusQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AlertLevel.Should().Be(ThresholdAlertLevel.Critical);
    }

    /// <summary>
    /// TAX-21.3.1: Exceeded alert when revenue passes $30,000.
    /// </summary>
    [Fact]
    public async Task GetThresholdStatus_ExceededAlert_Above100Percent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Add $35,000 in payments
        var payHandler = new RecordPaymentHandler(db, new TaxFakeCurrentUserService());
        await payHandler.Handle(
            new RecordPaymentCommand(null, null, null, 3500000, 0, "cad", PaymentMethod.CreditCard,
                null, null, "Exceeding payment", false, null),
            CancellationToken.None);

        // Act
        var handler = new GetThresholdStatusHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(new GetThresholdStatusQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AlertLevel.Should().Be(ThresholdAlertLevel.Exceeded);
        result.Value.ThresholdPercentage.Should().BeGreaterThan(100);
    }

    /// <summary>
    /// TAX-21.3.1: Refunded payments are excluded from rolling revenue.
    /// </summary>
    [Fact]
    public async Task GetThresholdStatus_ExcludesRefunds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Add a payment and a refund
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 2000000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard,
            IsRefund = false
        });
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 500000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard,
            IsRefund = true
        });
        await db.SaveChangesAsync();

        // Act
        var handler = new GetThresholdStatusHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(new GetThresholdStatusQuery(), CancellationToken.None);

        // Assert - Only non-refund payment counted
        result.IsSuccess.Should().BeTrue();
        result.Value!.RollingRevenueCents.Should().Be(2000000);
    }

    /// <summary>
    /// TAX-21.4.1: Record a business expense with HST for ITC tracking.
    /// </summary>
    [Fact]
    public async Task RecordBusinessExpense_CreatesExpense()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new RecordBusinessExpenseHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(
            new RecordBusinessExpenseCommand(50000, 6500, ExpenseCategory.Equipment,
                DateTime.UtcNow, "Camera lens", "Camera Store"),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.AmountCents.Should().Be(50000);
        result.Value.HstPaidCents.Should().Be(6500);
        result.Value.Category.Should().Be(ExpenseCategory.Equipment);
        result.Value.Description.Should().Be("Camera lens");
        result.Value.Vendor.Should().Be("Camera Store");
    }

    /// <summary>
    /// TAX-21.4.1: Record expenses across multiple categories.
    /// </summary>
    [Fact]
    public async Task RecordBusinessExpense_MultipleCategories()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var handler = new RecordBusinessExpenseHandler(db, new TaxFakeCurrentUserService());

        // Act
        await handler.Handle(
            new RecordBusinessExpenseCommand(10000, 1300, ExpenseCategory.Software,
                DateTime.UtcNow, "Lightroom subscription", "Adobe"),
            CancellationToken.None);
        await handler.Handle(
            new RecordBusinessExpenseCommand(25000, 3250, ExpenseCategory.Travel,
                DateTime.UtcNow, "Travel to shoot", null),
            CancellationToken.None);

        // Assert
        var expenses = await db.BusinessExpenses.ToListAsync();
        expenses.Should().HaveCount(2);
        expenses.Should().Contain(e => e.Category == ExpenseCategory.Software);
        expenses.Should().Contain(e => e.Category == ExpenseCategory.Travel);
    }

    /// <summary>
    /// TAX-21.4.2: Get ITC summary comparing HST collected vs. HST paid on expenses.
    /// </summary>
    [Fact]
    public async Task GetItcSummary_CalculatesNetHstOwing()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Add payments with tax
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 100000,
            TaxCents = 13000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 50000,
            TaxCents = 6500,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        // Add expenses with HST paid
        var expenseHandler = new RecordBusinessExpenseHandler(db, userService);
        await expenseHandler.Handle(
            new RecordBusinessExpenseCommand(30000, 3900, ExpenseCategory.Equipment,
                DateTime.UtcNow, "Lens", "Store"),
            CancellationToken.None);
        await expenseHandler.Handle(
            new RecordBusinessExpenseCommand(10000, 1300, ExpenseCategory.Software,
                DateTime.UtcNow, "Software", "Adobe"),
            CancellationToken.None);

        // Act
        var handler = new GetItcSummaryHandler(db, userService);
        var result = await handler.Handle(new GetItcSummaryQuery(null, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstCollectedCents.Should().Be(19500); // 13000 + 6500
        result.Value.HstPaidOnExpensesCents.Should().Be(5200); // 3900 + 1300
        result.Value.NetHstOwingCents.Should().Be(14300); // 19500 - 5200
        result.Value.CategoryBreakdown.Should().HaveCount(2);
        result.Value.CategoryBreakdown.Should().Contain(c => c.Category == ExpenseCategory.Equipment && c.HstPaidCents == 3900);
        result.Value.CategoryBreakdown.Should().Contain(c => c.Category == ExpenseCategory.Software && c.HstPaidCents == 1300);
    }

    /// <summary>
    /// TAX-21.4.2: ITC summary filters by date range.
    /// </summary>
    [Fact]
    public async Task GetItcSummary_FiltersDateRange()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var userService = new TaxFakeCurrentUserService();

        // Add expense in January
        var janExpense = new BusinessExpense
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 10000,
            HstPaidCents = 1300,
            Category = ExpenseCategory.Supplies,
            Date = new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc),
            Description = "Jan supplies"
        };
        db.BusinessExpenses.Add(janExpense);

        // Add expense in June
        var junExpense = new BusinessExpense
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 20000,
            HstPaidCents = 2600,
            Category = ExpenseCategory.Marketing,
            Date = new DateTime(2025, 6, 15, 0, 0, 0, DateTimeKind.Utc),
            Description = "Jun marketing"
        };
        db.BusinessExpenses.Add(junExpense);
        await db.SaveChangesAsync();

        // Act - Query only Q1
        var handler = new GetItcSummaryHandler(db, userService);
        var result = await handler.Handle(
            new GetItcSummaryQuery(
                new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 3, 31, 0, 0, 0, DateTimeKind.Utc)),
            CancellationToken.None);

        // Assert - Only Jan expense
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstPaidOnExpensesCents.Should().Be(1300);
        result.Value.CategoryBreakdown.Should().HaveCount(1);
    }

    /// <summary>
    /// TAX-21.4.2: ITC summary returns zero when no data.
    /// </summary>
    [Fact]
    public async Task GetItcSummary_ReturnsZero_WhenNoData()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new GetItcSummaryHandler(db, new TaxFakeCurrentUserService());
        var result = await handler.Handle(new GetItcSummaryQuery(null, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.HstCollectedCents.Should().Be(0);
        result.Value.HstPaidOnExpensesCents.Should().Be(0);
        result.Value.NetHstOwingCents.Should().Be(0);
        result.Value.CategoryBreakdown.Should().BeEmpty();
    }

    /// <summary>
    /// TAX-21.3.2: Threshold alert notification when crossing 75%.
    /// Tests the CheckThresholdAfterPaymentHandler directly.
    /// </summary>
    [Fact]
    public async Task ThresholdCheck_CreatesNotification_WhenCrossing75Percent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Pre-seed payments just under 75% ($22,500 = 75% of $30,000)
        // Seed $20,000 in existing payments
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 2000000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        // Add the payment that crosses 75% ($20,000 + $3,000 = $23,000 = 76.7%)
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 300000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        // Create a simple mediator mock that captures published notifications
        var capturedNotifications = new List<object>();
        var mockMediator = new CapturingMediator(capturedNotifications);

        // Act
        var handler = new CheckThresholdAfterPaymentHandler(db, mockMediator);
        await handler.Handle(
            new PaymentRecordedEvent(TestHelper.TestPhotographerId, 300000),
            CancellationToken.None);

        // Assert
        capturedNotifications.Should().HaveCount(1);
        var notification = capturedNotifications[0] as Anansi.Application.Features.Notifications.Events.NotificationEvent;
        notification.Should().NotBeNull();
        notification!.EventType.Should().Be(NotificationEventType.HstThresholdWarning);
        notification.Title.Should().Contain("Warning");
    }

    /// <summary>
    /// TAX-21.3.2: Threshold alert notification when crossing 90%.
    /// </summary>
    [Fact]
    public async Task ThresholdCheck_CreatesNotification_WhenCrossing90Percent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Pre-seed $26,000 in existing payments (86.7%)
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 2600000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        // Add $2,000 payment that crosses 90% ($26,000 + $2,000 = $28,000 = 93.3%)
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 200000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        var capturedNotifications = new List<object>();
        var mockMediator = new CapturingMediator(capturedNotifications);

        // Act
        var handler = new CheckThresholdAfterPaymentHandler(db, mockMediator);
        await handler.Handle(
            new PaymentRecordedEvent(TestHelper.TestPhotographerId, 200000),
            CancellationToken.None);

        // Assert
        capturedNotifications.Should().HaveCount(1);
        var notification = capturedNotifications[0] as Anansi.Application.Features.Notifications.Events.NotificationEvent;
        notification.Should().NotBeNull();
        notification!.EventType.Should().Be(NotificationEventType.HstThresholdCritical);
    }

    /// <summary>
    /// TAX-21.3.2: No notification when threshold not crossed.
    /// </summary>
    [Fact]
    public async Task ThresholdCheck_NoNotification_WhenBelowThreshold()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Add small payment
        db.Set<PaymentRecord>().Add(new PaymentRecord
        {
            PhotographerId = TestHelper.TestPhotographerId,
            AmountCents = 100000,
            Currency = "cad",
            PaymentMethod = PaymentMethod.CreditCard
        });
        await db.SaveChangesAsync();

        var capturedNotifications = new List<object>();
        var mockMediator = new CapturingMediator(capturedNotifications);

        // Act
        var handler = new CheckThresholdAfterPaymentHandler(db, mockMediator);
        await handler.Handle(
            new PaymentRecordedEvent(TestHelper.TestPhotographerId, 100000),
            CancellationToken.None);

        // Assert
        capturedNotifications.Should().BeEmpty();
    }
}

/// <summary>
/// Minimal MediatR implementation that captures published notifications for assertion.
/// </summary>
internal class CapturingMediator : IMediator
{
    private readonly List<object> _captured;
    public CapturingMediator(List<object> captured) => _captured = captured;

    public Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        _captured.Add(notification);
        return Task.CompletedTask;
    }

    public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        _captured.Add(notification!);
        return Task.CompletedTask;
    }

    public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
        where TRequest : IRequest
        => throw new NotImplementedException();

    public Task<object?> Send(object request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
