using Anansi.Application.Features.CRM.Contracts;
using Anansi.Domain.Enums;
using Anansi.Tests.Acceptance.Fixtures;
using Anansi.Tests.Acceptance.Helpers;
using FluentAssertions;

namespace Anansi.Tests.Acceptance.CRM;

/// <summary>
/// Acceptance tests for CON-4.4.1 through CON-4.4.7.
/// </summary>
public class ContractTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public ContractTests(TestWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// CON-4.4.1: Rich contract with fields and auto-created signature slots.
    /// CON-4.4.2: Client-fillable fields.
    /// CON-4.4.3: Auto-population variables.
    /// CON-4.4.4: Default photographer + client signature fields.
    /// </summary>
    [Fact]
    public async Task CreateContract_WithFieldsAndSignatures()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var fields = new List<CreateContractFieldInput>
        {
            new("Client Address", "123 Main St", false, null, 0),
            new("Client Name", null, true, "client_name", 1)
        };

        // Act
        var handler = new CreateContractHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateContractCommand("Wedding Photography Contract", "<h1>Contract</h1><p>Terms...</p>",
                "https://img.example.com/header.jpg", null, null, 14, true, 3, false, null, fields),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Fields.Count.Should().Be(2);
        result.Value.Fields[1].IsVariable.Should().BeTrue();
        result.Value.Fields[1].VariableKey.Should().Be("client_name");
        result.Value.Signatures.Count.Should().Be(2); // Photographer + Client
        result.Value.ExpiryDays.Should().Be(14);
        result.Value.AutoRemindersEnabled.Should().BeTrue();
    }

    /// <summary>
    /// CON-4.4.5: Contract templates can be saved and reused.
    /// </summary>
    [Fact]
    public async Task CreateContractTemplate_Succeeds()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        // Act
        var handler = new CreateContractHandler(db, new FakeCurrentUserService());
        var result = await handler.Handle(
            new CreateContractCommand("Standard Wedding Template", "<h1>Template</h1>",
                null, null, null, 7, false, null, true, "Wedding Template v1", null),
            CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsTemplate.Should().BeTrue();
        result.Value.TemplateName.Should().Be("Wedding Template v1");
    }

    /// <summary>
    /// CON-4.4.6: Sending sets expiry date.
    /// CON-4.4.4: E-Signing captures timestamp.
    /// </summary>
    [Fact]
    public async Task SendAndSign_Contract()
    {
        // Arrange
        var db = TestHelper.CreateInMemoryContext();
        await TestHelper.SeedPhotographer(db);

        var createHandler = new CreateContractHandler(db, new FakeCurrentUserService());
        var contract = await createHandler.Handle(
            new CreateContractCommand("Test Contract", "<p>Content</p>", null, null, null, 7, false, null, false, null, null),
            CancellationToken.None);

        // Act - Send
        var sendHandler = new SendContractHandler(db, new FakeCurrentUserService());
        var sendResult = await sendHandler.Handle(new SendContractCommand(contract.Value!.Id), CancellationToken.None);

        // Assert - Send
        sendResult.IsSuccess.Should().BeTrue();

        // Act - Sign (client signs)
        var clientSigId = contract.Value.Signatures.First(s => s.SignerRole == "Client").Id;
        var photographerSigId = contract.Value.Signatures.First(s => s.SignerRole == "Photographer").Id;

        var signHandler = new SignContractHandler(db);
        await signHandler.Handle(
            new SignContractCommand(contract.Value.Id, photographerSigId, "base64photographersig", "Test Photographer", "test@studio.com", "127.0.0.1", "TestAgent"),
            CancellationToken.None);
        var signResult = await signHandler.Handle(
            new SignContractCommand(contract.Value.Id, clientSigId, "base64clientsig", "Test Client", "client@test.com", "127.0.0.1", "TestAgent"),
            CancellationToken.None);

        // Assert - Sign
        signResult.IsSuccess.Should().BeTrue();

        // Verify contract is now signed
        var getHandler = new GetContractHandler(db, new FakeCurrentUserService());
        var final = await getHandler.Handle(new GetContractQuery(contract.Value.Id), CancellationToken.None);
        final.Value!.Status.Should().Be(ContractStatus.Signed);
    }
}
