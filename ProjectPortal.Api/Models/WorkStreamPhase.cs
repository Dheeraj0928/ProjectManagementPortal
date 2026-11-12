namespace ProjectPortal.Api.Models;

public class WorkStreamPhase
{
    public int PhaseId { get; set; }
    public int WorkStreamId { get; set; }
    public string PhaseName { get; set; } = string.Empty;
    public int? OnshoreManagerId { get; set; }
    public int? OffshoreManagerId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Description { get; set; }

    public ProjectWorkStream WorkStream { get; set; } = null!;
    public Employee? OnshoreManager { get; set; }
    public Employee? OffshoreManager { get; set; }
    public List<PhaseEffort> Efforts { get; set; } = [];
}
