using Anansi.Application.Features.Booking;
using Anansi.Application.Features.Events;
using Anansi.Domain.Entities.Events;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.CRM;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Tests.Acceptance.Events;

/// <summary>
/// Acceptance tests for EVT-24 Toronto Black Events Calendar.
/// </summary>
public class EventTests : IClassFixture<Fixtures.TestWebApplicationFactory>
{
    private readonly Fixtures.TestWebApplicationFactory _factory;
    public EventTests(Fixtures.TestWebApplicationFactory factory) => _factory = factory;

    // ──────────────────────────────────────────────────
    // EVT-24.1.1: Seed Toronto Black Cultural Events
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task SeedEvents_ContainsAtLeastSixEvents()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        SeedCommunityEvents(db);

        // Act
        var seeded = await db.Set<CommunityEvent>().Where(e => e.IsSeeded).ToListAsync();

        // Assert
        seeded.Count.Should().BeGreaterThanOrEqualTo(6);
    }

    [Theory]
    [InlineData("Toronto Caribbean Carnival (Caribana)", EventCategory.Festival, 7, 8)]
    [InlineData("Afrofest", EventCategory.Festival, 7, 7)]
    [InlineData("Afro-Carib Fest", EventCategory.Festival, 8, 8)]
    [InlineData("KUUMBA", EventCategory.Cultural, 2, 2)]
    [InlineData("Toronto Black Film Festival", EventCategory.Cultural, 2, 2)]
    [InlineData("Black History Month Toronto", EventCategory.Community, 2, 2)]
    public async Task SeedEvents_HasCorrectMetadata(string name, EventCategory category, int startMonth, int endMonth)
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        // Act
        var evt = await db.Set<CommunityEvent>().FirstOrDefaultAsync(e => e.Name == name);

        // Assert
        evt.Should().NotBeNull();
        evt!.Category.Should().Be(category);
        evt.TypicalStartMonth.Should().Be(startMonth);
        evt.TypicalEndMonth.Should().Be(endMonth);
        evt.IsSeeded.Should().BeTrue();
        evt.Status.Should().Be(EventStatus.Approved);
        evt.Recurrence.Should().Be(EventRecurrence.Annual);
        evt.WebsiteUrl.Should().NotBeNullOrWhiteSpace();
        evt.Venue.Should().NotBeNullOrWhiteSpace();
        evt.Neighborhood.Should().NotBeNullOrWhiteSpace();
        evt.Description.Should().NotBeNullOrWhiteSpace();
    }

    // ──────────────────────────────────────────────────
    // EVT-24.1.2: Create Community Event
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task CreateEvent_Returns201_WithStatusApproved()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var handler = new CreateEventHandler(db, new FakeCurrentUserService());
        var command = new CreateEventCommand(
            "Scarborough Jerk Fest",
            "Annual celebration of Caribbean jerk cuisine",
            new DateTime(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 16, 22, 0, 0, DateTimeKind.Utc),
            "Thomson Memorial Park",
            "Scarborough",
            EventCategory.Festival,
            EventRecurrence.Annual,
            "https://www.scarboroughjerkfest.com");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(EventStatus.Approved); // MVP: self-approve
        result.Value.Name.Should().Be("Scarborough Jerk Fest");
        result.Value.SubmittedByPhotographerId.Should().Be(TestHelper.TestPhotographerId);
        result.Value.IsSeeded.Should().BeFalse();
        result.Value.Category.Should().Be(EventCategory.Festival);
        result.Value.Recurrence.Should().Be(EventRecurrence.Annual);
        result.Value.Venue.Should().Be("Thomson Memorial Park");
        result.Value.Neighborhood.Should().Be("Scarborough");
    }

    [Fact]
    public async Task CreateEvent_RequiresName()
    {
        // Arrange
        var validator = new CreateEventValidator();
        var command = new CreateEventCommand(
            "",
            null,
            DateTime.UtcNow.AddDays(30),
            null, null, null,
            EventCategory.Community,
            EventRecurrence.None,
            null);

        // Act
        var validationResult = await validator.ValidateAsync(command);

        // Assert
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public async Task CreateEvent_RequiresStartDate()
    {
        // Arrange
        var validator = new CreateEventValidator();
        var command = new CreateEventCommand(
            "Test Event",
            null,
            default,
            null, null, null,
            EventCategory.Community,
            EventRecurrence.None,
            null);

        // Act
        var validationResult = await validator.ValidateAsync(command);

        // Assert
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().Contain(e => e.PropertyName == "StartDate");
    }

    // ──────────────────────────────────────────────────
    // EVT-24.2.1: List Events by Date Range
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task ListEvents_ByDateRange_ReturnsApprovedEventsOnly()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var createHandler = new CreateEventHandler(db, new FakeCurrentUserService());
        await createHandler.Handle(new CreateEventCommand(
            "Test Approved Event", null,
            new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 6, 2, 0, 0, 0, DateTimeKind.Utc),
            null, null, EventCategory.Community, EventRecurrence.None, null), CancellationToken.None);

        // Add a rejected event (should not appear)
        var pendingEvt = new CommunityEvent
        {
            Name = "Rejected Event",
            StartDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            Category = EventCategory.Community,
            Status = EventStatus.Rejected,
            IsSeeded = false
        };
        db.Set<CommunityEvent>().Add(pendingEvt);
        await db.SaveChangesAsync();

        var listHandler = new ListEventsHandler(db);

        // Act - query for February (should get annual recurring seed events)
        var result = await listHandler.Handle(
            new ListEventsQuery(
                new DateTime(2026, 2, 1),
                new DateTime(2026, 2, 28),
                null, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().Contain(e => e.Name == "KUUMBA");
        result.Value!.Should().Contain(e => e.Name == "Toronto Black Film Festival");
        result.Value!.Should().Contain(e => e.Name == "Black History Month Toronto");
        result.Value!.Should().NotContain(e => e.Name == "Rejected Event");
    }

    [Fact]
    public async Task ListEvents_FilterByCategory()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var handler = new ListEventsHandler(db);

        // Act - filter by Festival category for July-August
        var result = await handler.Handle(
            new ListEventsQuery(
                new DateTime(2026, 7, 1),
                new DateTime(2026, 8, 31),
                EventCategory.Festival, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().OnlyContain(e => e.Category == EventCategory.Festival);
        result.Value!.Should().Contain(e => e.Name.Contains("Caribana"));
        result.Value!.Should().Contain(e => e.Name == "Afrofest");
    }

    [Fact]
    public async Task ListEvents_FilterByNeighborhood()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var handler = new ListEventsHandler(db);

        // Act
        var result = await handler.Handle(
            new ListEventsQuery(
                new DateTime(2026, 1, 1),
                new DateTime(2026, 12, 31),
                null, "Scarborough"),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().OnlyContain(e => e.Neighborhood == "Scarborough");
        result.Value!.Should().Contain(e => e.Name == "Afro-Carib Fest");
    }

    [Fact]
    public async Task ListEvents_AnnualRecurring_GeneratesInstancesForQueriedYear()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var handler = new ListEventsHandler(db);

        // Act - query for full year
        var result = await handler.Handle(
            new ListEventsQuery(
                new DateTime(2026, 1, 1),
                new DateTime(2026, 12, 31),
                null, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var caribana = result.Value!.First(e => e.Name.Contains("Caribana"));
        caribana.StartDate.Should().NotBeNull();
        caribana.StartDate!.Value.Year.Should().Be(2026);
        caribana.StartDate!.Value.Month.Should().Be(7);
    }

    [Fact]
    public async Task ListEvents_OrderedByStartDate()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var handler = new ListEventsHandler(db);

        // Act
        var result = await handler.Handle(
            new ListEventsQuery(
                new DateTime(2026, 1, 1),
                new DateTime(2026, 12, 31),
                null, null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dates = result.Value!
            .Where(e => e.StartDate.HasValue)
            .Select(e => e.StartDate!.Value)
            .ToList();
        dates.Should().BeInAscendingOrder();
    }

    // ──────────────────────────────────────────────────
    // EVT-24.2.2: Sync Event to Booking Calendar
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task SyncEventToCalendar_CreatesBlock()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var caribanaId = Guid.Parse("e0000000-0000-0000-0000-000000000001");
        var handler = new SyncEventToCalendarHandler(db, new FakeCurrentUserService());

        // Act
        var result = await handler.Handle(
            new SyncEventToCalendarCommand(caribanaId, CalendarBlockType.Blocked),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CommunityEventId.Should().Be(caribanaId);
        result.Value.BlockType.Should().Be(CalendarBlockType.Blocked);
        result.Value.EventName.Should().Contain("Caribana");
        result.Value.PhotographerId.Should().Be(TestHelper.TestPhotographerId);
    }

    [Fact]
    public async Task SyncEventToCalendar_UpdatesExistingBlock()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var caribanaId = Guid.Parse("e0000000-0000-0000-0000-000000000001");
        var handler = new SyncEventToCalendarHandler(db, new FakeCurrentUserService());

        // Create first block
        await handler.Handle(
            new SyncEventToCalendarCommand(caribanaId, CalendarBlockType.Tentative),
            CancellationToken.None);

        // Act - update to Blocked
        var result = await handler.Handle(
            new SyncEventToCalendarCommand(caribanaId, CalendarBlockType.Blocked),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.BlockType.Should().Be(CalendarBlockType.Blocked);

        var blockCount = await db.Set<EventCalendarBlock>()
            .CountAsync(b => b.CommunityEventId == caribanaId
                && b.PhotographerId == TestHelper.TestPhotographerId);
        blockCount.Should().Be(1);
    }

    [Fact]
    public async Task ListCalendarBlocks_ReturnsPhotographerBlocks()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var syncHandler = new SyncEventToCalendarHandler(db, new FakeCurrentUserService());
        await syncHandler.Handle(
            new SyncEventToCalendarCommand(
                Guid.Parse("e0000000-0000-0000-0000-000000000001"),
                CalendarBlockType.Blocked),
            CancellationToken.None);
        await syncHandler.Handle(
            new SyncEventToCalendarCommand(
                Guid.Parse("e0000000-0000-0000-0000-000000000002"),
                CalendarBlockType.Available),
            CancellationToken.None);

        var listHandler = new ListCalendarBlocksHandler(db, new FakeCurrentUserService());

        // Act
        var result = await listHandler.Handle(new ListCalendarBlocksQuery(null, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Count.Should().Be(2);
    }

    // ──────────────────────────────────────────────────
    // EVT-24.2.3: Create Event-Linked Session Type
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task CreateSessionType_WithEventId_LinksToEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var caribanaId = Guid.Parse("e0000000-0000-0000-0000-000000000001");
        var handler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());

        var command = new CreateSessionTypeCommand(
            "Caribana Portrait Session", "Festival portraits during Caribana",
            30, 15000, "Lakeshore Blvd", SessionVisibility.Public,
            10, 10, false, false, 0, 1, null, null, false, null, null, null,
            caribanaId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.CommunityEventId.Should().Be(caribanaId);
        result.Value.Name.Should().Be("Caribana Portrait Session");
    }

    [Fact]
    public async Task ListSessionTypes_FilterByEventId()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        SeedCommunityEvents(db);

        var caribanaId = Guid.Parse("e0000000-0000-0000-0000-000000000001");
        var createHandler = new CreateSessionTypeHandler(db, new FakeCurrentUserService());

        await createHandler.Handle(new CreateSessionTypeCommand(
            "Caribana Portraits", null, 30, 15000, null, SessionVisibility.Public,
            0, 0, false, false, 0, 1, null, null, false, null, null, null,
            caribanaId), CancellationToken.None);

        await createHandler.Handle(new CreateSessionTypeCommand(
            "Regular Portraits", null, 60, 25000, null, SessionVisibility.Public,
            0, 0, false, false, 0, 1, null, null, false, null, null, null),
            CancellationToken.None);

        var listHandler = new ListSessionTypesHandler(db, new FakeCurrentUserService());

        // Act
        var result = await listHandler.Handle(new ListSessionTypesQuery(caribanaId), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Count.Should().Be(1);
        result.Value!.First().Name.Should().Be("Caribana Portraits");
        result.Value!.First().CommunityEventId.Should().Be(caribanaId);
    }

    // ──────────────────────────────────────────────────
    // EVT-24.3.1: Moderate Community Events
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task UpdateEventStatus_ApprovesEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var evt = new CommunityEvent
        {
            Name = "Pending Event",
            Category = EventCategory.Community,
            Status = EventStatus.Pending,
            StartDate = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            SubmittedByPhotographerId = TestHelper.TestPhotographerId
        };
        db.Set<CommunityEvent>().Add(evt);
        await db.SaveChangesAsync();

        var handler = new UpdateEventStatusHandler(db, new FakeCurrentUserService());

        // Act
        var result = await handler.Handle(
            new UpdateEventStatusCommand(evt.Id, EventStatus.Approved),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(EventStatus.Approved);
    }

    [Fact]
    public async Task UpdateEventStatus_RejectsEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var evt = new CommunityEvent
        {
            Name = "Event To Reject",
            Category = EventCategory.Community,
            Status = EventStatus.Pending,
            StartDate = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            SubmittedByPhotographerId = TestHelper.TestPhotographerId
        };
        db.Set<CommunityEvent>().Add(evt);
        await db.SaveChangesAsync();

        var handler = new UpdateEventStatusHandler(db, new FakeCurrentUserService());

        // Act
        var result = await handler.Handle(
            new UpdateEventStatusCommand(evt.Id, EventStatus.Rejected),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be(EventStatus.Rejected);
    }

    [Fact]
    public async Task UpdateEventStatus_Validates_OnlyApprovedOrRejected()
    {
        // Arrange
        var validator = new UpdateEventStatusValidator();
        var command = new UpdateEventStatusCommand(Guid.NewGuid(), EventStatus.Pending);

        // Act
        var validationResult = await validator.ValidateAsync(command);

        // Assert
        validationResult.IsValid.Should().BeFalse();
    }

    // ──────────────────────────────────────────────────
    // EVT-24.3.2: Edit and Cancel Own Events
    // ──────────────────────────────────────────────────

    [Fact]
    public async Task UpdateEvent_Returns200_WhenOwnEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var createHandler = new CreateEventHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(new CreateEventCommand(
            "Original Name", "Original desc",
            new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 10, 2, 0, 0, 0, DateTimeKind.Utc),
            "Original Venue", "Scarborough",
            EventCategory.Community, EventRecurrence.None, null), CancellationToken.None);

        var updateHandler = new UpdateEventHandler(db, new FakeCurrentUserService());

        // Act
        var result = await updateHandler.Handle(new UpdateEventCommand(
            created.Value!.Id,
            "Updated Name", "Updated desc",
            new DateTime(2026, 10, 5, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 10, 6, 0, 0, 0, DateTimeKind.Utc),
            "New Venue", "Little Jamaica",
            EventCategory.Festival, EventRecurrence.Annual, "https://updated.com"), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Name.Should().Be("Updated Name");
        result.Value.Venue.Should().Be("New Venue");
        result.Value.Neighborhood.Should().Be("Little Jamaica");
        result.Value.Category.Should().Be(EventCategory.Festival);
    }

    [Fact]
    public async Task UpdateEvent_Forbidden_WhenNotOwnEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var evt = new CommunityEvent
        {
            Name = "Not My Event",
            Category = EventCategory.Community,
            Status = EventStatus.Approved,
            StartDate = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            SubmittedByPhotographerId = Guid.NewGuid() // different photographer
        };
        db.Set<CommunityEvent>().Add(evt);
        await db.SaveChangesAsync();

        var updateHandler = new UpdateEventHandler(db, new FakeCurrentUserService());

        // Act
        var result = await updateHandler.Handle(new UpdateEventCommand(
            evt.Id, "Hack", null,
            new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            null, null, null,
            EventCategory.Community, EventRecurrence.None, null), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task DeleteEvent_SoftDeletes_OwnEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var createHandler = new CreateEventHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(new CreateEventCommand(
            "Event to Delete", null,
            new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc),
            null, null, null,
            EventCategory.Community, EventRecurrence.None, null), CancellationToken.None);

        var deleteHandler = new DeleteEventHandler(db, new FakeCurrentUserService());

        // Act
        var result = await deleteHandler.Handle(
            new DeleteEventCommand(created.Value!.Id), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Verify soft-deleted (query filter hides it)
        var found = await db.Set<CommunityEvent>()
            .FirstOrDefaultAsync(e => e.Id == created.Value.Id);
        found.Should().BeNull(); // hidden by soft-delete filter
    }

    [Fact]
    public async Task DeleteEvent_Forbidden_WhenNotOwnEvent()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var evt = new CommunityEvent
        {
            Name = "Not My Event",
            Category = EventCategory.Community,
            Status = EventStatus.Approved,
            StartDate = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
            SubmittedByPhotographerId = Guid.NewGuid()
        };
        db.Set<CommunityEvent>().Add(evt);
        await db.SaveChangesAsync();

        var deleteHandler = new DeleteEventHandler(db, new FakeCurrentUserService());

        // Act
        var result = await deleteHandler.Handle(
            new DeleteEventCommand(evt.Id), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.StatusCode.Should().Be(403);
    }

    // ──────────────────────────────────────────────────
    // Helper methods
    // ──────────────────────────────────────────────────

    private static void SeedCommunityEvents(Infrastructure.Persistence.ApplicationDbContext db)
    {
        var seedEvents = new[]
        {
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000001"),
                Name = "Toronto Caribbean Carnival (Caribana)",
                Description = "North America's largest Caribbean festival celebrating Caribbean culture, music, and cuisine.",
                Venue = "Lakeshore Blvd West",
                Neighborhood = "Lakeshore",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 7,
                TypicalEndMonth = 8,
                WebsiteUrl = "https://www.torontocarnival.ca",
                Status = EventStatus.Approved,
                IsSeeded = true
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000002"),
                Name = "Afrofest",
                Description = "Canada's largest free celebration of African music, culture, and heritage.",
                Venue = "Woodbine Park",
                Neighborhood = "The Beaches",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 7,
                TypicalEndMonth = 7,
                WebsiteUrl = "https://www.afrofest.ca",
                Status = EventStatus.Approved,
                IsSeeded = true
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000003"),
                Name = "Afro-Carib Fest",
                Description = "A vibrant celebration of African and Caribbean culture in Scarborough.",
                Venue = "Thomson Memorial Park",
                Neighborhood = "Scarborough",
                Category = EventCategory.Festival,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 8,
                TypicalEndMonth = 8,
                WebsiteUrl = "https://www.afrocaribfest.com",
                Status = EventStatus.Approved,
                IsSeeded = true
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000004"),
                Name = "KUUMBA",
                Description = "Toronto's premier Black arts festival held during Black History Month.",
                Venue = "Harbourfront Centre",
                Neighborhood = "Harbourfront",
                Category = EventCategory.Cultural,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.harbourfrontcentre.com/kuumba",
                Status = EventStatus.Approved,
                IsSeeded = true
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000005"),
                Name = "Toronto Black Film Festival",
                Description = "An annual celebration of the global Black experience through cinema.",
                Venue = "Various venues",
                Neighborhood = "Downtown",
                Category = EventCategory.Cultural,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.torontoblackfilm.com",
                Status = EventStatus.Approved,
                IsSeeded = true
            },
            new CommunityEvent
            {
                Id = Guid.Parse("e0000000-0000-0000-0000-000000000006"),
                Name = "Black History Month Toronto",
                Description = "City-wide celebration honoring the legacy, history, achievements, and contributions of Black Canadians.",
                Venue = "City-wide",
                Neighborhood = "City-wide",
                Category = EventCategory.Community,
                Recurrence = EventRecurrence.Annual,
                TypicalStartMonth = 2,
                TypicalEndMonth = 2,
                WebsiteUrl = "https://www.toronto.ca/blackhistorymonth",
                Status = EventStatus.Approved,
                IsSeeded = true
            }
        };

        foreach (var evt in seedEvents)
        {
            if (!db.Set<CommunityEvent>().Any(e => e.Id == evt.Id))
                db.Set<CommunityEvent>().Add(evt);
        }
        db.SaveChanges();
    }
}
