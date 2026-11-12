
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
    // Search, filter and pagination
    [HttpGet]
    public async Task<ActionResult<ProjectPageDto>> GetProjects(
        int pageNumber = 1,
        int pageSize = 10,
        string searchText = "",
        string searchColumn = "all",
        string status = "All",
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(
                "Page number must be positive and page size must be between 1 and 100.");
        }

        if (searchColumn != "all" &&
            searchColumn != "code" &&
            searchColumn != "customer" &&
            searchColumn != "name")
        {
            return BadRequest("Invalid search column.");
        }

        // Read projects from database
        var query = _context.Projects.AsNoTracking();

        // Count projects by status
        var statusCounts = await query
            .GroupBy(p => p.StatusDetails!.StatusName)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToDictionaryAsync(
                x => x.Status,
                x => x.Count,
                cancellationToken);

        // Search projects
        var search = (searchText ?? "").Trim().ToLower();

        if (search.Length > 0)
        {
            if (searchColumn == "code")
            {
                query = query.Where(p =>
                    p.Code.ToLower().Contains(search));
            }
            else if (searchColumn == "customer")
            {
                query = query.Where(p =>
                    p.CustomerDetails!.CustomerName.ToLower().Contains(search));
            }
            else if (searchColumn == "name")
            {
                query = query.Where(p =>
                    p.Name.ToLower().Contains(search));
            }
            else
            {
                query = query.Where(p =>
                    p.Code.ToLower().Contains(search) ||
                    p.CustomerDetails!.CustomerName.ToLower().Contains(search) ||
                    p.Name.ToLower().Contains(search));
            }
        }

        // Filter by status
        if (status != "All")
        {
            query = query.Where(p =>
                p.StatusDetails!.StatusName == status);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var totalPages = Math.Max(
            1,
            (int)Math.Ceiling(totalCount / (double)pageSize));

        pageNumber = Math.Min(pageNumber, totalPages);

        // Convert database projects into API response
        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProjectResponseDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,

                Customer = p.CustomerDetails!.CustomerName,
                CustomerId = p.CustomerId,

                StartDate = p.StartDate,
                EndDate = p.EndDate,
                RevisedEndDate = p.RevisedEndDate,
                RenewalDate = p.RenewalDate,
                IssueDate = p.IssueDate,

                EstimatedHours = p.EstimatedHours,
                ActualHours = p.ActualHours,

                OnshoreManager =
                    p.OnshoreManagerDetails!.EmployeeName,
                OnshoreManagerId = p.OnshoreManagerId,

                OffshoreManager =
                    p.OffshoreManagerDetails!.EmployeeName,
                OffshoreManagerId = p.OffshoreManagerId,

                Status = p.StatusDetails!.StatusName,
                StatusId = p.StatusId,

                CreatedAt = p.CreatedAt
            })
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
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailDto>> GetProject(int id)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProjectDetailDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,

                Customer = p.CustomerDetails!.CustomerName,
                CustomerId = p.CustomerId,

                StartDate = p.StartDate,
                EndDate = p.EndDate,
                RevisedEndDate = p.RevisedEndDate,
                RenewalDate = p.RenewalDate,
                IssueDate = p.IssueDate,

                EstimatedHours = p.EstimatedHours,
                ActualHours = p.ActualHours,

                OnshoreManager =
                    p.OnshoreManagerDetails!.EmployeeName,
                OnshoreManagerId = p.OnshoreManagerId,

                OffshoreManager =
                    p.OffshoreManagerDetails!.EmployeeName,
                OffshoreManagerId = p.OffshoreManagerId,

                Status = p.StatusDetails!.StatusName,
                StatusId = p.StatusId,

                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound();
        }

        project.Tasks = await _context.ProjectTasks.AsNoTracking().AsSplitQuery()
            .Where(t => t.ProjectId == id)
            .OrderBy(t => t.TaskId)
            .Select(t => new ProjectTaskDto
            {
                TaskId = t.TaskId,
                WorkStream = t.WorkStream,
                Phase = t.Phase,
                Category = t.Category,
                TaskName = t.TaskName,
                SubTasks = t.SubTasks.Select(s => s.SubTaskName).ToList(),
                Employees = t.AssignedEmployees.Select(a => a.Employee.EmployeeName).ToList(),
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                InitialPlanHours = t.InitialPlanHours,
                TaskType = t.TaskType,
                IsActive = t.IsActive
            }).ToListAsync();

        project.WorkStreams = await _context.ProjectWorkStreams.AsNoTracking().AsSplitQuery()
            .Where(w => w.ProjectId == id)
            .OrderBy(w => w.WorkStreamId)
            .Select(w => new ProjectWorkStreamDto
            {
                WorkStreamId = w.WorkStreamId,
                WorkStreamName = w.WorkStreamName,
                Phases = w.Phases.OrderBy(ph => ph.PhaseId).Select(ph => new WorkStreamPhaseDto
                {
                    PhaseId = ph.PhaseId,
                    PhaseName = ph.PhaseName,
                    OnshoreManager = ph.OnshoreManager != null ? ph.OnshoreManager.EmployeeName : null,
                    OffshoreManager = ph.OffshoreManager != null ? ph.OffshoreManager.EmployeeName : null,
                    StartDate = ph.StartDate,
                    EndDate = ph.EndDate,
                    Description = ph.Description,
                    Efforts = ph.Efforts.OrderBy(e => e.PhaseEffortId).Select(e => new PhaseEffortDto
                    {
                        PhaseEffortId = e.PhaseEffortId,
                        ReleaseName = e.ReleaseName,
                        EstimatedHours = e.EstimatedHours
                    }).ToList()
                }).ToList()
            }).ToListAsync();

        project.ClientContacts = await _context.ClientContacts.AsNoTracking()
            .Where(c => c.CustomerId == project.CustomerId)
            .Select(c => new ClientContactDto
            {
                ContactName = c.ContactName,
                ContactEmail = c.ContactEmail,
                ContactType = c.ContactType
            }).ToListAsync();

        return Ok(project);
    }

    // POST: api/projects
    // Create a new project
    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject(
        CreateProjectDto dto)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Code) ||
            string.IsNullOrWhiteSpace(dto.Customer) ||
            string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(
                "Project Code, Customer and Name are required.");
        }

        if (string.IsNullOrWhiteSpace(dto.OnshoreManager) ||
            string.IsNullOrWhiteSpace(dto.OffshoreManager))
        {
            return BadRequest("Both managers are required.");
        }

        var code = dto.Code.Trim();

        // Check duplicate project code
        var codeExists = await _context.Projects
            .AnyAsync(p => p.Code == code);

        if (codeExists)
        {
            return Conflict("Project code already exists.");
        }

        // Find or create customer and employees
        var customer = await FindOrCreateCustomer(dto.Customer);
        var onshore = await FindOrCreateEmployee(dto.OnshoreManager);
        var offshore = await FindOrCreateEmployee(dto.OffshoreManager);

        var statusName = string.IsNullOrWhiteSpace(dto.Status)
            ? "In Progress"
            : dto.Status.Trim();

        var projectStatus = await FindOrCreateStatus(statusName);

        // Save only IDs, not old text columns
        var project = new Project
        {
            Code = code,
            Name = dto.Name.Trim(),

            CustomerId = customer.CustomerId,

            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            RevisedEndDate = dto.RevisedEndDate,
            RenewalDate = dto.RenewalDate,
            IssueDate = dto.IssueDate,

            EstimatedHours = dto.EstimatedHours,
            ActualHours = dto.ActualHours,

            OnshoreManagerId = onshore.EmployeeId,
            OffshoreManagerId = offshore.EmployeeId,
            StatusId = projectStatus.StatusId,

            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Return project details including related names
        var response = new ProjectResponseDto
        {
            Id = project.Id,
            Code = project.Code,
            Name = project.Name,

            Customer = customer.CustomerName,
            CustomerId = project.CustomerId,

            StartDate = project.StartDate,
            EndDate = project.EndDate,
            RevisedEndDate = project.RevisedEndDate,
            RenewalDate = project.RenewalDate,
            IssueDate = project.IssueDate,

            EstimatedHours = project.EstimatedHours,
            ActualHours = project.ActualHours,

            OnshoreManager = onshore.EmployeeName,
            OnshoreManagerId = project.OnshoreManagerId,

            OffshoreManager = offshore.EmployeeName,
            OffshoreManagerId = project.OffshoreManagerId,

            Status = projectStatus.StatusName,
            StatusId = project.StatusId,

            CreatedAt = project.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetProject),
            new { id = project.Id },
            response);
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

        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Code) ||
            string.IsNullOrWhiteSpace(dto.Customer) ||
            string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(
                "Project Code, Customer and Name are required.");
        }

        if (string.IsNullOrWhiteSpace(dto.OnshoreManager) ||
            string.IsNullOrWhiteSpace(dto.OffshoreManager))
        {
            return BadRequest("Both managers are required.");
        }

        var code = dto.Code.Trim();

        var codeExists = await _context.Projects
            .AnyAsync(p => p.Code == code && p.Id != id);

        if (codeExists)
        {
            return Conflict("Project code already exists.");
        }

        // Find related records
        var customer = await FindOrCreateCustomer(dto.Customer);
        var onshore = await FindOrCreateEmployee(dto.OnshoreManager);
        var offshore = await FindOrCreateEmployee(dto.OffshoreManager);

        // Keep current status when new status is empty
        var currentStatusName = await _context.ProjectStatuses
            .Where(s => s.StatusId == project.StatusId)
            .Select(s => s.StatusName)
            .FirstOrDefaultAsync();

        var statusName = string.IsNullOrWhiteSpace(dto.Status)
            ? currentStatusName ?? "In Progress"
            : dto.Status.Trim();

        var projectStatus = await FindOrCreateStatus(statusName);

        // Update project details
        project.Code = code;
        project.Name = dto.Name.Trim();

        project.CustomerId = customer.CustomerId;

        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.RevisedEndDate = dto.RevisedEndDate;
        project.RenewalDate = dto.RenewalDate;
        project.IssueDate = dto.IssueDate;

        project.EstimatedHours = dto.EstimatedHours;
        project.ActualHours = dto.ActualHours;

        project.OnshoreManagerId = onshore.EmployeeId;
        project.OffshoreManagerId = offshore.EmployeeId;
        project.StatusId = projectStatus.StatusId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/projects/1
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

    // Find or create customer
    private async Task<Customer> FindOrCreateCustomer(string name)
    {
        name = name.Trim();

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.CustomerName == name);

        if (customer != null)
        {
            return customer;
        }

        customer = new Customer
        {
            CustomerName = name
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return customer;
    }

    // Find or create employee
    private async Task<Employee> FindOrCreateEmployee(string name)
    {
        name = name.Trim();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.EmployeeName == name);

        if (employee != null)
        {
            return employee;
        }

        employee = new Employee
        {
            EmployeeName = name
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return employee;
    }

    // Find or create project status
    private async Task<ProjectStatus> FindOrCreateStatus(string name)
    {
        name = name.Trim();

        var status = await _context.ProjectStatuses
            .FirstOrDefaultAsync(s => s.StatusName == name);

        if (status != null)
        {
            return status;
        }

        status = new ProjectStatus
        {
            StatusName = name
        };

        _context.ProjectStatuses.Add(status);
        await _context.SaveChangesAsync();

        return status;
    }
}
