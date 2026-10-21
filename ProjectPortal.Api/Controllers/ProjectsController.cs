using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectPortal.Api.Data;
using ProjectPortal.Api.Models;

namespace ProjectPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProjectsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/projects?pageNumber=1&pageSize=10
    [HttpGet]
    public async Task< ActionResult<ProjectPageDto>> GetProjects(
        int pageNumber = 1,
        int pageSize = 10,
        string searchText = "",
        string searchColumn = "all",
        string status = "All",
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("Page number must be positive and page size must be between 1 and 100.");
        }

        if (searchColumn != "all" && searchColumn != "code" &&
            searchColumn != "customer" && searchColumn != "name")
        {
            return BadRequest("Invalid search column.");
        }

        var query = _context.Projects.AsNoTracking();

        // Counts describe the full list, not just the current page.
        var statusCounts = await query
            .GroupBy(p => p.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Status, item => item.Count, cancellationToken);

        var search = searchText.Trim().ToLower();
        if (search.Length > 0)
        {
            if (searchColumn == "code")
                query = query.Where(p => p.Code.ToLower().Contains(search));
            else if (searchColumn == "customer")
                query = query.Where(p => p.Customer.ToLower().Contains(search));
            else if (searchColumn == "name")
                query = query.Where(p => p.Name.ToLower().Contains(search));
            else
                query = query.Where(p => p.Code.ToLower().Contains(search) ||
                    p.Customer.ToLower().Contains(search) || p.Name.ToLower().Contains(search));
        }

        if (status != "All")
        {
            query = query.Where(p => p.Status == status);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize));

        // After deleting the last row on a page, return the last valid page.
        pageNumber = Math.Min(pageNumber, totalPages);

        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Ok(new ProjectPageDto
        {
            Items = projects,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalProjects = statusCounts.Values.Sum(),
            StatusCounts = statusCounts
        });
    }

    // GET: api/projects/1
    // Get project by ID
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    // POST: api/projects
    // Create a new project
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(
        CreateProjectDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code) ||
            string.IsNullOrWhiteSpace(dto.Customer) ||
            string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(
                "Project Code, Customer and Name are required.");
        }

        var project = new Project
        {
            Code = dto.Code.Trim(),
            Customer = dto.Customer.Trim(),
            Name = dto.Name.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            RevisedEndDate = dto.RevisedEndDate,
            RenewalDate = dto.RenewalDate,
            IssueDate = dto.IssueDate,
            EstimatedHours = dto.EstimatedHours,
            ActualHours = dto.ActualHours,
            OnshoreManager = dto.OnshoreManager?.Trim() ?? string.Empty,
            OffshoreManager = dto.OffshoreManager?.Trim() ?? string.Empty,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "In Progress" : dto.Status.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProject),
            new { id = project.Id },
            project);
    }

    // PUT: api/projects/1
    // Update an existing project
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProject(
        int id,
        CreateProjectDto dto)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(dto.Code) ||
            string.IsNullOrWhiteSpace(dto.Customer) ||
            string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(
                "Project Code, Customer and Name are required.");
        }

        project.Code = dto.Code.Trim();
        project.Customer = dto.Customer.Trim();
        project.Name = dto.Name.Trim();

        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.RevisedEndDate = dto.RevisedEndDate;
        project.RenewalDate = dto.RenewalDate;
        project.IssueDate = dto.IssueDate;

        project.EstimatedHours = dto.EstimatedHours;
        project.ActualHours = dto.ActualHours;

        project.OnshoreManager = dto.OnshoreManager?.Trim() ?? string.Empty;
        project.OffshoreManager = dto.OffshoreManager?.Trim() ?? string.Empty;

        project.Status = string.IsNullOrWhiteSpace(dto.Status) ? project.Status : dto.Status.Trim();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/projects/1
    // Delete project by ID
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        _context.Projects.Remove(project);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
