namespace ProjectPortal.Api.Models;

public class Project
{
    public int Id {get;set;}
    public string Code{get;set;}=string.Empty;
    public string Name{get;set;}=string.Empty;

    public DateTime? StartDate{get;set;}
    public DateTime? EndDate{get;set;}
    public DateTime? RevisedEndDate{get;set;}
    public DateTime? RenewalDate{get;set;}
    public DateTime? IssueDate{get;set;}

    public decimal EstimatedHours{get;set;}
    public decimal? ActualHours{get;set;}
    public DateTime CreatedAt{get;set;}=DateTime.UtcNow;

    public int CustomerId {get;set;}
    public Customer CustomerDetails {get;set;}=null!;
    public int OnshoreManagerId{get;set;}
    public Employee OnshoreManagerDetails{get;set;}=null!;
    public int OffshoreManagerId{get;set;}
    public Employee OffshoreManagerDetails{get;set;}=null!;
    public int StatusId{get;set;}

    public ProjectStatus StatusDetails{get;set;}=null!;

    public List<ProjectTask> Tasks { get; set; } = [];
    public List<ProjectWorkStream> WorkStreams { get; set; } = [];
}
