
using System.ComponentModel.DataAnnotations;

namespace ProjectPortal.Api.Models;

public class ProjectStatus
{
    [Key]
    public int StatusId { get; set; }

    public string StatusName { get; set; } = string.Empty;
}
