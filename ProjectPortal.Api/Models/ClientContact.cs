namespace ProjectPortal.Api.Models;

public class ClientContact
{
    public int ClientContactId { get; set; }
    public int CustomerId { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactType { get; set; } = string.Empty;

    public Customer Customer { get; set; } = null!;
}
