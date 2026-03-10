using System.Net;
using System.Net.Http.Json;
using Anansi.Application.DTOs;
using Anansi.Application.Features.CRM.Contacts;
using Anansi.Domain.Enums;
using Anansi.Infrastructure.Persistence;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for CRM-4.1.1 through CRM-4.1.5.
/// </summary>
public class ContactTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ContactTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// CRM-4.1.1: Three contact types (Client, Lead, Other), CRUD operations.
    /// </summary>
    [Fact]
    public async Task CreateContact_WithValidData_ReturnsCreated()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var command = new CreateContactCommand(
            "John", "Doe", "john@example.com", "+1234567890",
            "123 Main St", "Toronto", "ON", "M5V1A1", "CA",
            "Test notes", ContactType.Client);

        // Act
        var handler = new CreateContactHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.FirstName.Should().Be("John");
        result.Value.LastName.Should().Be("Doe");
        result.Value.ContactType.Should().Be(ContactType.Client);
    }

    /// <summary>
    /// CRM-4.1.1: Contact type must be manually changeable.
    /// </summary>
    [Fact]
    public async Task UpdateContact_ChangeType_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var createHandler = new CreateContactHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(
            new CreateContactCommand("Jane", "Lead", "jane@example.com", null, null, null, null, null, null, null, ContactType.Lead),
            CancellationToken.None);

        // Act
        var updateHandler = new UpdateContactHandler(db, new FakeCurrentUserService());
        var result = await updateHandler.Handle(
            new UpdateContactCommand(created.Value!.Id, "Jane", "Lead", "jane@example.com", null, null, null, null, null, null, null, ContactType.Client),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ContactType.Should().Be(ContactType.Client);
    }

    /// <summary>
    /// CRM-4.1.2: Contact profile returns all contact details.
    /// </summary>
    [Fact]
    public async Task GetContact_ReturnsFullProfile()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var createHandler = new CreateContactHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(
            new CreateContactCommand("Profile", "Test", "profile@test.com", "+1111111111", "456 Oak", "NYC", "NY", "10001", "US", "Profile notes", ContactType.Client),
            CancellationToken.None);

        // Act
        var getHandler = new GetContactHandler(db, new FakeCurrentUserService());
        var result = await getHandler.Handle(new GetContactQuery(created.Value!.Id), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Email.Should().Be("profile@test.com");
        result.Value.Phone.Should().Be("+1111111111");
        result.Value.Notes.Should().Be("Profile notes");
    }

    /// <summary>
    /// CRM-4.1.4: Contact import with duplicate detection.
    /// </summary>
    [Fact]
    public async Task ImportContacts_SkipsDuplicates()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var createHandler = new CreateContactHandler(db, new FakeCurrentUserService());
        await createHandler.Handle(
            new CreateContactCommand("Existing", "User", "existing@test.com", null, null, null, null, null, null, null, ContactType.Client),
            CancellationToken.None);

        var rows = new List<ImportContactRow>
        {
            new("Existing", "User", "existing@test.com", null, null, null, ContactType.Client),
            new("New", "Contact", "new@test.com", null, null, null, ContactType.Lead)
        };

        // Act
        var importHandler = new ImportContactsHandler(db, new FakeCurrentUserService());
        var result = await importHandler.Handle(new ImportContactsCommand(rows, true), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Imported.Should().Be(1);
        result.Value.Skipped.Should().Be(1);
    }

    /// <summary>
    /// CRM-4.1.1: Delete contact (soft delete).
    /// </summary>
    [Fact]
    public async Task DeleteContact_SoftDeletes()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var createHandler = new CreateContactHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(
            new CreateContactCommand("ToDelete", "User", "delete@test.com", null, null, null, null, null, null, null, ContactType.Other),
            CancellationToken.None);

        // Act
        var deleteHandler = new DeleteContactHandler(db, new FakeCurrentUserService());
        var result = await deleteHandler.Handle(new DeleteContactCommand(created.Value!.Id), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var getHandler = new GetContactHandler(db, new FakeCurrentUserService());
        var getResult = await getHandler.Handle(new GetContactQuery(created.Value.Id), CancellationToken.None);
        getResult.IsSuccess.Should().BeFalse(); // Filtered by soft-delete
    }

    /// <summary>
    /// CRM-4.1.5: Lead capture form submission auto-creates contact and project.
    /// </summary>
    [Fact]
    public async Task SubmitLeadCaptureForm_CreatesContactAndProject()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        await TestHelper.SeedDefaultStages(db);

        var formHandler = new CreateLeadCaptureFormHandler(db, new FakeCurrentUserService());
        var form = await formHandler.Handle(
            new CreateLeadCaptureFormCommand("Wedding Inquiry", null, ContactType.Lead, new List<CreateFormFieldInput>()),
            CancellationToken.None);

        // Act
        var submitHandler = new SubmitLeadCaptureFormHandler(db);
        var result = await submitHandler.Handle(
            new SubmitLeadCaptureFormCommand(form.Value!.Slug, "Alice", "Wonder", "alice@test.com", "Interested in wedding package", "{}"),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ContactId.Should().NotBeNull();
        result.Value.SubmitterEmail.Should().Be("alice@test.com");
    }
}

internal class FakeCurrentUserService : Anansi.Application.Interfaces.ICurrentUserService
{
    public string? UserId => "test-user";
    public Guid? PhotographerId => TestHelper.TestPhotographerId;
    public bool IsAuthenticated => true;
}
