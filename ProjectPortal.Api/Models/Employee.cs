using System.ComponentModel.DataAnnotations;

namespace ProjectPortal.Api.Models;

public class Employee
{
    [Key]
    public int EmployeeId{get;set;}
    public string EmployeeName{get;set;}=string.Empty;
}