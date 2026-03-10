using Anansi.Application.Common;
using Anansi.Application.DTOs;
using Anansi.Application.Features.CRM.Contacts;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContactsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ContactsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create(CreateContactCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { id = result.Value!.Id }, result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetContactQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ContactType? type, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListContactsQuery(type, search, page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateContactCommand command, CancellationToken ct)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteContactCommand(id), ct);
        return result.IsSuccess ? NoContent() : NotFound(result.Error);
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import(ImportContactsCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("lead-capture-forms")]
    public async Task<IActionResult> CreateForm(CreateLeadCaptureFormCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/contacts/lead-capture-forms/{result.Value!.Id}", result.Value) : BadRequest(result.Error);
    }

    [HttpPost("lead-capture-forms/{slug}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitForm(string slug, SubmitLeadCaptureFormCommand command, CancellationToken ct)
    {
        if (slug != command.FormSlug)
        {
            command = command with { FormSlug = slug };
        }
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
