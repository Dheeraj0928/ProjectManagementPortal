namespace ProjectPortal.Api.Models;

public class ProjectTask
{
    public int TaskId { get; set; }
    public int ProjectId { get; set; }
    public string WorkStream { get; set; } = string.Empty;
    public string Phase { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string? SubTaskSummary { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? RevisedStartDate { get; set; }
    public DateTime? RevisedEndDate { get; set; }
    public decimal InitialPlanHours { get; set; }
    public decimal? RevisedPlanHours { get; set; }
    public string TaskType { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public Project Project { get; set; } = null!;
    public List<ProjectSubTask> SubTasks { get; set; } = [];
    public List<TaskEmployee> AssignedEmployees { get; set; } = [];
}
