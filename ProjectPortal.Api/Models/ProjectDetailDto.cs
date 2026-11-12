namespace ProjectPortal.Api.Models;

public class ProjectDetailDto : ProjectResponseDto
{
    public List<ProjectTaskDto> Tasks { get; set; } = [];
    public List<ProjectWorkStreamDto> WorkStreams { get; set; } = [];
    public List<ClientContactDto> ClientContacts { get; set; } = [];
}

public class ProjectTaskDto
{
    public int TaskId { get; set; }
    public string WorkStream { get; set; } = string.Empty;
    public string Phase { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public List<string> SubTasks { get; set; } = [];
    public List<string> Employees { get; set; } = [];
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal InitialPlanHours { get; set; }
    public string TaskType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class ProjectWorkStreamDto
{
    public int WorkStreamId { get; set; }
    public string WorkStreamName { get; set; } = string.Empty;
    public List<WorkStreamPhaseDto> Phases { get; set; } = [];
}

public class WorkStreamPhaseDto
{
    public int PhaseId { get; set; }
    public string PhaseName { get; set; } = string.Empty;
    public string? OnshoreManager { get; set; }
    public string? OffshoreManager { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }
    public List<PhaseEffortDto> Efforts { get; set; } = [];
}

public class PhaseEffortDto
{
    public int PhaseEffortId { get; set; }
    public string ReleaseName { get; set; } = string.Empty;
    public decimal EstimatedHours { get; set; }
}

public class ClientContactDto
{
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactType { get; set; } = string.Empty;
}
