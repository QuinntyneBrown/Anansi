using Anansi.Application.Features.CRM.Quotes;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for QOT-4.6.1 through QOT-4.6.3.
/// </summary>
public class QuoteTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public QuoteTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// QOT-4.6.1: Create a quote with itemized pricing.
    /// </summary>
    [Fact]
    public async Task CreateQuote_WithItems_CalculatesTotal()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var items = new List<CreateQuoteItemInput>
        {
            new("Wedding Photography", "Full day coverage", 1, 300000, 0),
            new("Engagement Session", "1 hour", 1, 50000, 1)
        };

        // Act
        var handler = new CreateQuoteHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateQuoteCommand("Wedding Package Quote", null, null, null, false, null, items),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TotalCents.Should().Be(350000);
        result.Value.Items.Count.Should().Be(2);
        result.Value.Status.Should().Be(QuoteStatus.Draft);
    }

    /// <summary>
    /// QOT-4.6.2: Accepting a quote auto-creates an invoice draft.
    /// </summary>
    [Fact]
    public async Task AcceptQuote_CreatesInvoiceDraft()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var items = new List<CreateQuoteItemInput> { new("Service", "Description", 1, 100000, 0) };
        var createHandler = new CreateQuoteHandler(db, new FakeCurrentUserService());
        var quote = await createHandler.Handle(
            new CreateQuoteCommand("Test Quote", null, null, null, false, null, items),
            CancellationToken.None);

        // Manually set to Sent so it can be accepted
        var entity = await db.Quotes.FirstAsync(q => q.Id == quote.Value!.Id);
        entity.Status = QuoteStatus.Sent;
        await db.SaveChangesAsync();

        // Act
        var acceptHandler = new AcceptQuoteHandler(db, new FakeCurrentUserService());
        var result = await acceptHandler.Handle(new AcceptQuoteCommand(quote.Value!.Id), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(QuoteStatus.Accepted);
        result.Value.GeneratedInvoiceId.Should().NotBeNull();

        // Verify invoice was created
        var invoice = await db.Invoices.FirstOrDefaultAsync(i => i.Id == result.Value.GeneratedInvoiceId);
        invoice.Should().NotBeNull();
        invoice!.Status.Should().Be(InvoiceStatus.Draft);
        invoice.TotalCents.Should().Be(100000);
    }

    /// <summary>
    /// QOT-4.6.3: Quote templates.
    /// </summary>
    [Fact]
    public async Task CreateQuoteTemplate_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var items = new List<CreateQuoteItemInput> { new("Package", null, 1, 50000, 0) };

        // Act
        var handler = new CreateQuoteHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateQuoteCommand("Standard Quote", null, null, null, true, "Standard Template", items),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsTemplate.Should().BeTrue();
    }
}
