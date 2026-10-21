namespace ProjectPortal.Api.Models;

public class ProjectPageDto
{
    public List<Project> Items { get; set; } = [];
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalProjects { get; set; }
    public Dictionary<string, int> StatusCounts { get; set; } = [];
}
