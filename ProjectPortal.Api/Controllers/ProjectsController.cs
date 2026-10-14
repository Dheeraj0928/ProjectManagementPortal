
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

    // GET: api/projects
    // Get all projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        return await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
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
