namespace ProjectPortal.Api.Models;

public class PhaseEffort
{
    public int PhaseEffortId { get; set; }
    public int PhaseId { get; set; }
    public string ReleaseName { get; set; } = string.Empty;
    public decimal EstimatedHours { get; set; }

    public WorkStreamPhase Phase { get; set; } = null!;
}
