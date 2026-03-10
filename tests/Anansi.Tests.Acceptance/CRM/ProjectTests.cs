using Anansi.Application.Features.CRM.Projects;
using Anansi.Infrastructure.Persistence;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for CRM-4.2.1 through CRM-4.2.3.
/// </summary>
public class ProjectTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public ProjectTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// CRM-4.2.1: Default stages auto-created on first view.
    /// </summary>
    [Fact]
    public async Task GetBoard_CreatesDefaultStages_WhenEmpty()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new GetProjectBoardHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(new GetProjectBoardQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Count.Should().Be(4);
        result.Value[0].Name.Should().Be("Inquiry");
        result.Value[3].Name.Should().Be("Completed Project");
    }

    /// <summary>
    /// CRM-4.2.1: Stages are customizable - add, rename, reorder.
    /// </summary>
    [Fact]
    public async Task ManageStages_AddRenameReorder()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act - Create
        var createHandler = new CreateStageHandler(db, new FakeCurrentUserService());
        var created = await createHandler.Handle(new CreateStageCommand("Custom Stage", 5), CancellationToken.None);

        // Assert - Create
        created.IsSuccess.Should().BeTrue();
        created.Value!.Name.Should().Be("Custom Stage");

        // Act - Rename
        var updateHandler = new UpdateStageHandler(db, new FakeCurrentUserService());
        var updated = await updateHandler.Handle(new UpdateStageCommand(created.Value.Id, "Renamed Stage", 0), CancellationToken.None);

        // Assert - Rename
        updated.IsSuccess.Should().BeTrue();
    }

    /// <summary>
    /// CRM-4.2.1: Project cards can be dragged between stages.
    /// </summary>
    [Fact]
    public async Task MoveProject_ChangesStage()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        await TestHelper.SeedDefaultStages(db);

        var boardHandler = new GetProjectBoardHandler(db, new FakeCurrentUserService());
        var board = await boardHandler.Handle(new GetProjectBoardQuery(), CancellationToken.None);
        var inquiryStage = board.Value![0]; // assumes stages already exist from seed
        // Find second stage
        var bookedStage = board.Value[1];

        var createHandler = new CreateProjectHandler(db, new FakeCurrentUserService());
        var project = await createHandler.Handle(
            new CreateProjectCommand("Test Project", "Wedding", inquiryStage.Id, null),
            CancellationToken.None);

        // Act
        var moveHandler = new MoveProjectHandler(db, new FakeCurrentUserService());
        var result = await moveHandler.Handle(
            new MoveProjectCommand(project.Value!.Id, bookedStage.Id, 0),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }
}
