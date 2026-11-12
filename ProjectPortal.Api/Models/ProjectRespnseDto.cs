namespace ProjectPortal.Api.Models;
public class ProjectResponseDto
{
    public int Id{get;set;}
    public string Code{get;set;}=string.Empty;
    public string Name{get;set;}=string.Empty;

    public string Customer {get;set;}=string.Empty;
    public int? CustomerId{get;set;}

    public DateTime? StartDate{get;set;}
    public DateTime? EndDate{get;set;}
    public DateTime? RevisedEndDate{get;set;}
    public DateTime? RenewalDate{get;set;}
    public DateTime? IssueDate{get;set;}

    public decimal EstimatedHours{get;set;}
    public decimal? ActualHours{get;set;}
    public string OnshoreManager{get;set;}=string.Empty;
    public int? OnshoreManagerId{get;set;}
    public string OffshoreManager{get;set;}=string.Empty;
    public int? OffshoreManagerId{get;set;}
    public string Status{get;set;}=string.Empty;
    public int? StatusId {get;set;}
    public DateTime CreatedAt{get;set;}
}