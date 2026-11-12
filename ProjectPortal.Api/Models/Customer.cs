using System.ComponentModel.DataAnnotations;

namespace ProjectPortal.Api.Models;

public class Customer
{
    [Key]
    public int CustomerId{get;set;}
    public string CustomerName{get;set;}=string.Empty;
    public List<ClientContact> Contacts { get; set; } = [];
}
