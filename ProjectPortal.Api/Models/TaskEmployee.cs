namespace ProjectPortal.Api.Models;

public class TaskEmployee
{
    public int TaskId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public ProjectTask Task { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
}
