using Anansi.Application.Features.Email;
using Anansi.Tests.Acceptance.CRM;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.Email;

/// <summary>
/// Acceptance tests for EML-5.1.1 through EML-5.3.4.
/// </summary>
public class EmailTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public EmailTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// EML-5.1.1: Send a new email creates a conversation threaded by client.
    /// </summary>
    [Fact]
    public async Task SendEmail_CreatesConversation()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new SendEmailHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new SendEmailCommand(null, "client@test.com", "Test Client", null, "Gallery Ready", "Your gallery is ready to view!", null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Subject.Should().Be("Gallery Ready");
        result.Value.ClientEmail.Should().Be("client@test.com");
        result.Value.Messages.Count.Should().Be(1);
        result.Value.Messages[0].IsFromPhotographer.Should().BeTrue();
    }

    /// <summary>
    /// EML-5.1.1: Reply to existing conversation threads into the same conversation.
    /// </summary>
    [Fact]
    public async Task ReplyToConversation_ThreadsMessage()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var handler = new SendEmailHandler(db, new FakeCurrentUserService());
        var conv = await handler.Handle(
            new SendEmailCommand(null, "client@test.com", "Client", null, "Subject", "First message", null),
            CancellationToken.None);

        // Act - Reply
        var reply = await handler.Handle(
            new SendEmailCommand(conv.Value!.Id, null, null, null, "Subject", "Follow up message", null),
            CancellationToken.None);

        // Assert
        reply.IsSuccess.Should().BeTrue();
        reply.Value!.Messages.Count.Should().Be(2);
    }

    /// <summary>
    /// EML-5.1.1: Unified inbox lists all conversations.
    /// </summary>
    [Fact]
    public async Task ListConversations_ReturnsAll()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var sendHandler = new SendEmailHandler(db, new FakeCurrentUserService());
        await sendHandler.Handle(
            new SendEmailCommand(null, "a@test.com", "A", null, "Subject A", "Body A", null),
            CancellationToken.None);
        await sendHandler.Handle(
            new SendEmailCommand(null, "b@test.com", "B", null, "Subject B", "Body B", null),
            CancellationToken.None);

        // Act
        var handler = new ListConversationsHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(new ListConversationsQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Items.Count.Should().BeGreaterThanOrEqualTo(2);
    }

    /// <summary>
    /// EML-5.2.1, EML-5.2.2: Create and list email templates by category.
    /// </summary>
    [Fact]
    public async Task ManageEmailTemplates()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var createHandler = new CreateEmailTemplateHandler(db, new FakeCurrentUserService());
        await createHandler.Handle(
            new CreateEmailTemplateCommand("Gallery Invite", "Gallery", "Your Gallery is Ready", "Hi {{client_name}}, your gallery is ready!", null, "https://img.com/header.jpg", true),
            CancellationToken.None);
        await createHandler.Handle(
            new CreateEmailTemplateCommand("Booking Confirm", "StudioManager", "Booking Confirmed", "Your session is confirmed!", null, null, true),
            CancellationToken.None);

        // Act - List all
        var listHandler = new ListEmailTemplatesHandler(db, new FakeCurrentUserService());
        var all = await listHandler.Handle(new ListEmailTemplatesQuery(null), CancellationToken.None);

        // Assert
        all.Value!.Count.Should().BeGreaterThanOrEqualTo(2);

        // Act - Filter by category
        var gallery = await listHandler.Handle(new ListEmailTemplatesQuery("Gallery"), CancellationToken.None);
        gallery.Value!.Count.Should().BeGreaterThanOrEqualTo(1);
        gallery.Value.All(t => t.Category == "Gallery").Should().BeTrue();
    }

    /// <summary>
    /// EML-5.2.3: Branded gallery invite template with header image.
    /// </summary>
    [Fact]
    public async Task CreateBrandedInviteTemplate()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new CreateEmailTemplateHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateEmailTemplateCommand("Branded Gallery Invite", "BrandedInvite",
                "View Your Photos!", "Hi {{client_name}}, click here to view: {{gallery_link}}. Password: {{password}}",
                null, "https://brand.example.com/header.jpg", true),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Category.Should().Be("BrandedInvite");
        result.Value.HeaderImageUrl.Should().NotBeNull();
        result.Value.UseBranding.Should().BeTrue();
    }

    /// <summary>
    /// EML-5.3.1 through EML-5.3.4: Automated email configuration.
    /// </summary>
    [Fact]
    public async Task ConfigureAutomatedEmails()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var handler = new UpsertAutomatedEmailConfigHandler(db, new FakeCurrentUserService());

        // Act - Booking confirmation (EML-5.3.1)
        var bookingConfig = await handler.Handle(
            new UpsertAutomatedEmailConfigCommand(null, "BookingConfirmation", true, null, null, null, null, null),
            CancellationToken.None);

        // Act - Session reminder (EML-5.3.1)
        var reminderConfig = await handler.Handle(
            new UpsertAutomatedEmailConfigCommand(null, "SessionReminder", true, null, 24, null, null, null),
            CancellationToken.None);

        // Act - Document reminder (EML-5.3.2)
        var docConfig = await handler.Handle(
            new UpsertAutomatedEmailConfigCommand(null, "ContractReminder", true, null, null, 3, null, null),
            CancellationToken.None);

        // Act - Gallery expiry (EML-5.3.3)
        var expiryConfig = await handler.Handle(
            new UpsertAutomatedEmailConfigCommand(null, "GalleryExpiryReminder", true, null, null, null,
                "[\"all_viewers\",\"all_downloaders\"]", "14,7,3"),
            CancellationToken.None);

        // Act - Payment confirmation (EML-5.3.4)
        var payConfig = await handler.Handle(
            new UpsertAutomatedEmailConfigCommand(null, "PaymentConfirmation", true, null, null, null, null, null),
            CancellationToken.None);

        // Assert
        bookingConfig.IsSuccess.Should().BeTrue();
        reminderConfig.Value!.TimingOffsetHours.Should().Be(24);
        docConfig.Value!.ReminderFrequencyDays.Should().Be(3);
        expiryConfig.Value!.RecipientTypes.Should().Contain("all_viewers");
        expiryConfig.Value.DaysBeforeEvent.Should().Be("14,7,3");
        payConfig.Value!.EventType.Should().Be("PaymentConfirmation");

        // Act - List all configs
        var listHandler = new ListAutomatedEmailConfigsHandler(db, new FakeCurrentUserService());
        var list = await listHandler.Handle(new ListAutomatedEmailConfigsQuery(), CancellationToken.None);
        list.Value!.Count.Should().BeGreaterThanOrEqualTo(5);
    }
}
