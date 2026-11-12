namespace ProjectPortal.Api.Models;

public class ProjectSubTask
{
    public int SubTaskId { get; set; }
    public int TaskId { get; set; }
    public string SubTaskName { get; set; } = string.Empty;

    public ProjectTask Task { get; set; } = null!;
}
