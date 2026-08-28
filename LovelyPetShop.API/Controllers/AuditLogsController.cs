using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditService _service;

    public AuditLogsController(IAuditService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetLogsAsync();
        return Ok(result);
    }
}
