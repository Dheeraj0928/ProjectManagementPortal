namespace ProjectPortal.Api.Models;
public class CreateProjectDto
{
    public string Code {get;set;}=string.Empty;
    public string Name {get;set;}=string.Empty;
    public string Customer{get;set;}=string.Empty;
    public DateTime? StartDate{get;set;}
    public DateTime? EndDate{get;set;}
    public DateTime? RevisedEndDate{get;set;}
    public DateTime? RenewalDate{get;set;}
    public DateTime? IssueDate{get;set;}
    public decimal EstimatedHours{get;set;}
    public decimal? ActualHours {get;set;}
    public string OnshoreManager{get;set;}=string.Empty;
    public string  OffshoreManager{get;set;}=string.Empty;
    public string Status{get;set;}="In Progress";


}