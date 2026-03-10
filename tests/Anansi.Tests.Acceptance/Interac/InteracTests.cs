using Anansi.Application.Features.CRM.Invoices;
using Anansi.Application.Features.Interac;
using Anansi.Domain.Entities;
using Anansi.Domain.Entities.Finance;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.CRM;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Interac;

/// <summary>
/// Acceptance tests for INT-20.1.1 through INT-20.2.2 (Interac e-Transfer Integration).
/// </summary>
public class InteracTests
{
    /// <summary>
    /// INT-20.1.1: Create Interac payment request from an invoice.
    /// Returns 201 with paymentReference, amount, recipientEmail, expiryDate.
    /// </summary>
    [Fact]
    public async Task CreateInteracPaymentRequest_FromInvoice_ReturnsPaymentReference()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 25000, 0) }, null),
            CancellationToken.None);

        // Act
        var handler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.PaymentReference.Should().StartWith("ANANSI-INV-");
        result.Value.AmountCents.Should().Be(25000);
        result.Value.RecipientEmail.Should().Be("payments@studio.com");
        result.Value.Status.Should().Be(InteracPaymentStatus.Pending);
        result.Value.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
        result.Value.InvoiceId.Should().Be(invoice.Value.Id);
    }

    /// <summary>
    /// INT-20.1.1: Creating request without Interac email configured fails.
    /// </summary>
    [Fact]
    public async Task CreateInteracPaymentRequest_WithoutInteracEmail_Fails()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 25000, 0) }, null),
            CancellationToken.None);

        // Act
        var handler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("not configured");
    }

    /// <summary>
    /// INT-20.1.1: Cannot create request for a fully paid invoice.
    /// </summary>
    [Fact]
    public async Task CreateInteracPaymentRequest_FullyPaidInvoice_Fails()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 25000, 0) }, null),
            CancellationToken.None);

        // Mark invoice as fully paid
        var inv = await db.Invoices.FirstAsync(i => i.Id == invoice.Value!.Id);
        inv.PaidCents = inv.TotalCents;
        inv.Status = InvoiceStatus.Paid;
        await db.SaveChangesAsync();

        // Act
        var handler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("already fully paid");
    }

    /// <summary>
    /// INT-20.1.2: Confirm Interac payment creates PaymentRecord and updates invoice.
    /// </summary>
    [Fact]
    public async Task ConfirmInteracPayment_CreatesPaymentRecord_UpdatesInvoice()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 50000, 0) }, null),
            CancellationToken.None);

        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var paymentRequest = await createHandler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Act
        var confirmHandler = new ConfirmInteracPaymentHandler(db, new FakeCurrentUserService());
        var result = await confirmHandler.Handle(
            new ConfirmInteracPaymentCommand(paymentRequest.Value!.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(InteracPaymentStatus.Completed);
        result.Value.ConfirmedAt.Should().NotBeNull();

        // Verify PaymentRecord was created
        var paymentRecord = await db.PaymentRecords
            .FirstOrDefaultAsync(p => p.InvoiceId == invoice.Value.Id);
        paymentRecord.Should().NotBeNull();
        paymentRecord!.PaymentMethod.Should().Be(PaymentMethod.InteracETransfer);
        paymentRecord.AmountCents.Should().Be(50000);
        paymentRecord.FeeCents.Should().Be(0);
        paymentRecord.NetAmountCents.Should().Be(50000);

        // Verify invoice status updated
        var updatedInvoice = await db.Invoices.FirstAsync(i => i.Id == invoice.Value.Id);
        updatedInvoice.PaidCents.Should().Be(50000);
        updatedInvoice.Status.Should().Be(InvoiceStatus.Paid);
    }

    /// <summary>
    /// INT-20.1.2: Confirming an already confirmed payment fails.
    /// </summary>
    [Fact]
    public async Task ConfirmInteracPayment_AlreadyConfirmed_Fails()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 50000, 0) }, null),
            CancellationToken.None);

        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var paymentRequest = await createHandler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        var confirmHandler = new ConfirmInteracPaymentHandler(db, new FakeCurrentUserService());
        await confirmHandler.Handle(new ConfirmInteracPaymentCommand(paymentRequest.Value!.Id), CancellationToken.None);

        // Act - try to confirm again
        var result = await confirmHandler.Handle(
            new ConfirmInteracPaymentCommand(paymentRequest.Value.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("already confirmed");
    }

    /// <summary>
    /// INT-20.1.3: List Interac payment requests with status filter.
    /// </summary>
    [Fact]
    public async Task ListInteracPaymentRequests_FilterByStatus()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice1 = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Session 1", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 25000, 0) }, null),
            CancellationToken.None);
        var invoice2 = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Session 2", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 35000, 0) }, null),
            CancellationToken.None);

        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var req1 = await createHandler.Handle(new CreateInteracPaymentRequestCommand(invoice1.Value!.Id), CancellationToken.None);
        var req2 = await createHandler.Handle(new CreateInteracPaymentRequestCommand(invoice2.Value!.Id), CancellationToken.None);

        // Confirm one
        var confirmHandler = new ConfirmInteracPaymentHandler(db, new FakeCurrentUserService());
        await confirmHandler.Handle(new ConfirmInteracPaymentCommand(req1.Value!.Id), CancellationToken.None);

        // Act - list all
        var listHandler = new GetInteracPaymentRequestsHandler(db, new FakeCurrentUserService());
        var allResult = await listHandler.Handle(new GetInteracPaymentRequestsQuery(null), CancellationToken.None);

        // Assert
        allResult.IsSuccess.Should().BeTrue();
        allResult.Value!.TotalCount.Should().Be(2);

        // Act - filter pending only
        var pendingResult = await listHandler.Handle(new GetInteracPaymentRequestsQuery(InteracPaymentStatus.Pending), CancellationToken.None);

        // Assert
        pendingResult.Value!.TotalCount.Should().Be(1);
        pendingResult.Value.Items[0].Status.Should().Be(InteracPaymentStatus.Pending);

        // Act - filter completed only
        var completedResult = await listHandler.Handle(new GetInteracPaymentRequestsQuery(InteracPaymentStatus.Completed), CancellationToken.None);

        // Assert
        completedResult.Value!.TotalCount.Should().Be(1);
        completedResult.Value.Items[0].Status.Should().Be(InteracPaymentStatus.Completed);
    }

    /// <summary>
    /// INT-20.1.4: Expired payment requests are detected on read.
    /// </summary>
    [Fact]
    public async Task ExpiredPaymentRequests_AutoDetectedOnRead()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Expired Test", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 20000, 0) }, null),
            CancellationToken.None);

        // Create a request and manually set it to be already expired
        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var req = await createHandler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        var entity = await db.InteracPaymentRequests.FirstAsync(r => r.Id == req.Value!.Id);
        entity.ExpiresAt = DateTime.UtcNow.AddDays(-1);
        await db.SaveChangesAsync();

        // Act - listing should auto-expire the stale request
        var listHandler = new GetInteracPaymentRequestsHandler(db, new FakeCurrentUserService());
        var result = await listHandler.Handle(new GetInteracPaymentRequestsQuery(null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Should().ContainSingle();
        result.Value.Items[0].Status.Should().Be(InteracPaymentStatus.Expired);
    }

    /// <summary>
    /// INT-20.1.4: Confirming an expired payment request fails.
    /// </summary>
    [Fact]
    public async Task ConfirmExpiredPayment_Fails()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Expired Test", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 20000, 0) }, null),
            CancellationToken.None);

        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var req = await createHandler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Manually expire the request
        var entity = await db.InteracPaymentRequests.FirstAsync(r => r.Id == req.Value!.Id);
        entity.ExpiresAt = DateTime.UtcNow.AddDays(-1);
        await db.SaveChangesAsync();

        // Act
        var confirmHandler = new ConfirmInteracPaymentHandler(db, new FakeCurrentUserService());
        var result = await confirmHandler.Handle(
            new ConfirmInteracPaymentCommand(req.Value!.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("expired");
    }

    /// <summary>
    /// INT-20.2.1: Configure and retrieve Interac e-Transfer settings.
    /// </summary>
    [Fact]
    public async Task ConfigureAndGetInteracSettings()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act - Get before configuring
        var getHandler = new GetInteracConfigHandler(db, new FakeCurrentUserService());
        var beforeResult = await getHandler.Handle(new GetInteracConfigQuery(), CancellationToken.None);

        // Assert - Not configured
        beforeResult.IsSuccess.Should().BeTrue();
        beforeResult.Value!.InteracEmail.Should().BeNull();
        beforeResult.Value.IsEnabled.Should().BeFalse();

        // Act - Configure
        var configHandler = new ConfigureInteracHandler(db, new FakeCurrentUserService());
        var configResult = await configHandler.Handle(
            new ConfigureInteracCommand("interac@studio.com"),
            CancellationToken.None);

        // Assert
        configResult.IsSuccess.Should().BeTrue();

        // Act - Get after configuring
        var afterResult = await getHandler.Handle(new GetInteracConfigQuery(), CancellationToken.None);

        // Assert
        afterResult.Value!.InteracEmail.Should().Be("interac@studio.com");
        afterResult.Value.IsEnabled.Should().BeTrue();
    }

    /// <summary>
    /// INT-20.1.2: Partial payment creates correct invoice status.
    /// </summary>
    [Fact]
    public async Task ConfirmInteracPayment_PartialPayment_UpdatesInvoiceStatusCorrectly()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        var photographer = await TestHelper.SeedPhotographer(db);
        photographer.InteracEmail = "payments@studio.com";
        await db.SaveChangesAsync();

        var invoiceHandler = new CreateInvoiceHandler(db, new FakeCurrentUserService());
        var invoice = await invoiceHandler.Handle(
            new CreateInvoiceCommand("Photo Session", null, null, null, 0, 0, false, null, false, null, false, null, null, null, null,
                new List<CreateInvoiceLineItemInput> { new("Session", null, 1, 100000, 0) }, null),
            CancellationToken.None);

        // Pre-pay part of the invoice so the Interac request only covers the remainder
        var inv = await db.Invoices.FirstAsync(i => i.Id == invoice.Value!.Id);
        inv.PaidCents = 50000;
        inv.Status = InvoiceStatus.PartiallyPaid;
        await db.SaveChangesAsync();

        var createHandler = new CreateInteracPaymentRequestHandler(db, new FakeCurrentUserService());
        var paymentRequest = await createHandler.Handle(
            new CreateInteracPaymentRequestCommand(invoice.Value!.Id),
            CancellationToken.None);

        // Assert - request amount is the remaining balance
        paymentRequest.Value!.AmountCents.Should().Be(50000);

        // Act - confirm
        var confirmHandler = new ConfirmInteracPaymentHandler(db, new FakeCurrentUserService());
        var result = await confirmHandler.Handle(
            new ConfirmInteracPaymentCommand(paymentRequest.Value.Id),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        var updatedInvoice = await db.Invoices.FirstAsync(i => i.Id == invoice.Value.Id);
        updatedInvoice.PaidCents.Should().Be(100000);
        updatedInvoice.Status.Should().Be(InvoiceStatus.Paid);
    }
}
