using Anansi.Application.Common;
using Anansi.Application.DTOs.Website;
using Anansi.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Application.Features.Website.Blog;

/// <summary>
/// WEB-3.3.1/3.3.2 - Blog categories: create, list, delete.
/// </summary>
public record CreateBlogCategoryCommand(string Name, string? Slug, string? Description) : IRequest<Result<BlogCategoryDto>>;

public class CreateBlogCategoryValidator : AbstractValidator<CreateBlogCategoryCommand>
{
    public CreateBlogCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public class CreateBlogCategoryHandler : IRequestHandler<CreateBlogCategoryCommand, Result<BlogCategoryDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateBlogCategoryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<BlogCategoryDto>> Handle(CreateBlogCategoryCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<BlogCategoryDto>.Failure("Not authenticated", 401);

        var slug = request.Slug ?? System.Text.RegularExpressions.Regex.Replace(request.Name.ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');

        var exists = await _db.Set<Domain.Entities.Website.BlogCategory>()
            .AnyAsync(c => c.PhotographerId == photographerId.Value && c.Slug == slug, ct);
        if (exists)
            return Result<BlogCategoryDto>.Failure("Category slug already exists");

        var maxOrder = await _db.Set<Domain.Entities.Website.BlogCategory>()
            .Where(c => c.PhotographerId == photographerId.Value)
            .MaxAsync(c => (int?)c.SortOrder, ct) ?? 0;

        var category = new Domain.Entities.Website.BlogCategory
        {
            PhotographerId = photographerId.Value,
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            SortOrder = maxOrder + 1
        };

        _db.Set<Domain.Entities.Website.BlogCategory>().Add(category);
        await _db.SaveChangesAsync(ct);

        return Result<BlogCategoryDto>.Success(new BlogCategoryDto(
            category.Id, category.Name, category.Slug, category.Description, category.SortOrder));
    }
}

public record ListBlogCategoriesQuery : IRequest<Result<List<BlogCategoryDto>>>;

public class ListBlogCategoriesHandler : IRequestHandler<ListBlogCategoriesQuery, Result<List<BlogCategoryDto>>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListBlogCategoriesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result<List<BlogCategoryDto>>> Handle(ListBlogCategoriesQuery request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result<List<BlogCategoryDto>>.Failure("Not authenticated", 401);

        var categories = await _db.Set<Domain.Entities.Website.BlogCategory>()
            .Where(c => c.PhotographerId == photographerId.Value)
            .OrderBy(c => c.SortOrder)
            .Select(c => new BlogCategoryDto(c.Id, c.Name, c.Slug, c.Description, c.SortOrder))
            .ToListAsync(ct);

        return Result<List<BlogCategoryDto>>.Success(categories);
    }
}

public record DeleteBlogCategoryCommand(Guid CategoryId) : IRequest<Result>;

public class DeleteBlogCategoryHandler : IRequestHandler<DeleteBlogCategoryCommand, Result>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteBlogCategoryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteBlogCategoryCommand request, CancellationToken ct)
    {
        var photographerId = _currentUser.PhotographerId;
        if (photographerId is null)
            return Result.Failure("Not authenticated", 401);

        var category = await _db.Set<Domain.Entities.Website.BlogCategory>()
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.PhotographerId == photographerId.Value, ct);
        if (category is null)
            return Result.NotFound("Category not found");

        _db.Set<Domain.Entities.Website.BlogCategory>().Remove(category);
        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}
