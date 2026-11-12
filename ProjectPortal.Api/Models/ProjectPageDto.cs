
namespace ProjectPortal.Api.Models;

public class ProjectPageDto
{
    // Current page ke projects
    public List<ProjectResponseDto> Items { get; set; } = new();

    // Search/filter ke baad total projects
    public int TotalCount { get; set; }

    // Database mein total projects
    public int TotalProjects { get; set; }

    // Current page number
    public int PageNumber { get; set; }

    // Ek page mein kitne projects
    public int PageSize { get; set; }

    // Har status ke projects ki count
    public Dictionary<string, int> StatusCounts { get; set; } = new();
}
