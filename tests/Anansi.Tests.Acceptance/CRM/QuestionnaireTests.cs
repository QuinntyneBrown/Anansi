using Anansi.Application.Features.CRM.Questionnaires;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for QST-4.7.1 through QST-4.7.4.
/// </summary>
public class QuestionnaireTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public QuestionnaireTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// QST-4.7.1: Create questionnaire with various question types.
    /// </summary>
    [Fact]
    public async Task CreateQuestionnaire_WithQuestions()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var questions = new List<CreateQuestionInput>
        {
            new("What is your wedding date?", QuestionType.Date, true, 0, null),
            new("Describe your vision", QuestionType.LongText, false, 1, null),
            new("Preferred style", QuestionType.MultipleChoice, true, 2, "[\"Classic\",\"Documentary\",\"Fine Art\"]"),
            new("Services needed", QuestionType.Checkboxes, true, 3, "[\"Photography\",\"Videography\",\"Album\"]"),
            new("Your email", QuestionType.Email, true, 4, null),
            new("Your name", QuestionType.ShortText, true, 5, null)
        };

        // Act
        var handler = new CreateQuestionnaireHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateQuestionnaireCommand("Wedding Questionnaire", "Pre-wedding info", null, null, false, 14, true, 3, false, null, questions),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Questions.Count.Should().Be(6);
        result.Value.Questions[0].QuestionType.Should().Be(QuestionType.Date);
        result.Value.Questions[2].Options.Should().Contain("Classic");
        result.Value.ExpiryDays.Should().Be(14);
    }

    /// <summary>
    /// QST-4.7.2: Questionnaire templates.
    /// </summary>
    [Fact]
    public async Task CreateQuestionnaireTemplate_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var questions = new List<CreateQuestionInput> { new("Question 1", QuestionType.ShortText, true, 0, null) };

        // Act
        var handler = new CreateQuestionnaireHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateQuestionnaireCommand("Template Q", null, null, null, false, null, false, null, true, "Standard Q", questions),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsTemplate.Should().BeTrue();
        result.Value.TemplateName.Should().Be("Standard Q");
    }

    /// <summary>
    /// QST-4.7.3: Submit response; single submission marks completed.
    /// </summary>
    [Fact]
    public async Task SubmitResponse_MarksCompleted()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var questions = new List<CreateQuestionInput> { new("Name?", QuestionType.ShortText, true, 0, null) };

        var createHandler = new CreateQuestionnaireHandler(db, new FakeCurrentUserService());
        var questionnaire = await createHandler.Handle(
            new CreateQuestionnaireCommand("Simple Q", null, null, null, false, null, false, null, false, null, questions),
            CancellationToken.None);

        // Set to Sent status so it can be answered
        var entity = await db.Questionnaires.FindAsync(questionnaire.Value!.Id);
        entity!.Status = QuestionnaireStatus.Sent;
        await db.SaveChangesAsync();

        // Act
        var submitHandler = new SubmitQuestionnaireResponseHandler(db);
        var result = await submitHandler.Handle(
            new SubmitQuestionnaireResponseCommand(questionnaire.Value!.Id, "respondent@test.com", "John Doe", "[{\"questionId\":\"...\",\"answer\":\"John\"}]"),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Second submission should fail (not multi-submission)
        var result2 = await submitHandler.Handle(
            new SubmitQuestionnaireResponseCommand(questionnaire.Value.Id, "another@test.com", "Jane", "[]"),
            CancellationToken.None);
        result2.IsSuccess.Should().BeFalse();
    }

    /// <summary>
    /// QST-4.7.3: Public questionnaire allows multiple submissions.
    /// </summary>
    [Fact]
    public async Task PublicQuestionnaire_AllowsMultipleSubmissions()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);
        var questions = new List<CreateQuestionInput> { new("RSVP", QuestionType.ShortText, true, 0, null) };

        var createHandler = new CreateQuestionnaireHandler(db, new FakeCurrentUserService());
        var questionnaire = await createHandler.Handle(
            new CreateQuestionnaireCommand("Event RSVP", null, null, null, true, null, false, null, false, null, questions),
            CancellationToken.None);

        var entity = await db.Questionnaires.FindAsync(questionnaire.Value!.Id);
        entity!.Status = QuestionnaireStatus.Sent;
        await db.SaveChangesAsync();

        // Act
        var submitHandler = new SubmitQuestionnaireResponseHandler(db);
        var r1 = await submitHandler.Handle(
            new SubmitQuestionnaireResponseCommand(questionnaire.Value!.Id, "a@test.com", "A", "[]"), CancellationToken.None);
        var r2 = await submitHandler.Handle(
            new SubmitQuestionnaireResponseCommand(questionnaire.Value.Id, "b@test.com", "B", "[]"), CancellationToken.None);

        // Assert
        r1.IsSuccess.Should().BeTrue();
        r2.IsSuccess.Should().BeTrue();
    }
}
