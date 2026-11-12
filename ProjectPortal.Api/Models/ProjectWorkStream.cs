namespace ProjectPortal.Api.Models;

public class ProjectWorkStream
{
    public int WorkStreamId { get; set; }
    public int ProjectId { get; set; }
    public string WorkStreamName { get; set; } = string.Empty;

    public Project Project { get; set; } = null!;
    public List<WorkStreamPhase> Phases { get; set; } = [];
}
