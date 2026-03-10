using Anansi.Application.Features.Website.Blog;
using Anansi.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Anansi.Api.Controllers;

/// <summary>
/// WEB-3.3.1 Blog Post Management, WEB-3.3.2 Blog Layouts, WEB-3.3.3 Blog Migration.
/// </summary>
[ApiController]
[Route("api/websites/{websiteId:guid}/blog")]
[Authorize]
public class BlogController : ControllerBase
{
    private readonly IMediator _mediator;

    public BlogController(IMediator mediator) => _mediator = mediator;

    [HttpGet("posts")]
    public async Task<IActionResult> ListPosts(Guid websiteId,
        [FromQuery] BlogPostStatus? status,
        [FromQuery] Guid? categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListBlogPostsQuery(websiteId, status, categoryId, page, pageSize), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost(Guid websiteId, [FromBody] CreateBlogPostCommand command, CancellationToken ct)
    {
        if (websiteId != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"api/websites/{websiteId}/blog/posts/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPut("posts/{postId:guid}")]
    public async Task<IActionResult> UpdatePost(Guid websiteId, Guid postId, [FromBody] UpdateBlogPostCommand command, CancellationToken ct)
    {
        if (postId != command.BlogPostId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("posts/{postId:guid}/duplicate")]
    public async Task<IActionResult> DuplicatePost(Guid websiteId, Guid postId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DuplicateBlogPostCommand(postId), ct);
        return result.IsSuccess ? Created($"api/websites/{websiteId}/blog/posts/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("posts/{postId:guid}")]
    public async Task<IActionResult> DeletePost(Guid websiteId, Guid postId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteBlogPostCommand(postId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("posts/import")]
    public async Task<IActionResult> ImportPost(Guid websiteId, [FromBody] ImportBlogPostCommand command, CancellationToken ct)
    {
        if (websiteId != command.WebsiteId)
            return BadRequest("Route ID does not match body");
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"api/websites/{websiteId}/blog/posts/{result.Value!.Id}", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> ListCategories(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListBlogCategoriesQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateBlogCategoryCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created("", result.Value) : StatusCode(result.StatusCode ?? 400, result.Error);
    }

    [HttpDelete("categories/{categoryId:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid categoryId, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteBlogCategoryCommand(categoryId), ct);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode ?? 400, result.Error);
    }
}
