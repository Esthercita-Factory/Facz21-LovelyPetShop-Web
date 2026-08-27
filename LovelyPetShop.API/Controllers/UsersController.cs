using LovelyPetShop.API.DTOs;
using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = UserRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        var dtos = users.Select(u => new
        {
            u.Uuid,
            u.Username,
            u.Email,
            u.FullName,
            u.Role,
            u.OwnerId,
            u.EmployeeId,
            u.IsActive,
            u.CreatedAt
        });
        return Ok(dtos);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> GetById(string uuid)
    {
        var u = await _userService.GetUserByIdAsync(uuid);
        if (u == null) return NotFound(new { message = "Usuario no encontrado." });

        return Ok(new
        {
            u.Uuid,
            u.Username,
            u.Email,
            u.FullName,
            u.Role,
            u.OwnerId,
            u.EmployeeId,
            u.IsActive,
            u.CreatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequestDto request)
    {
        try
        {
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Role = string.IsNullOrWhiteSpace(request.Role) ? UserRoles.Cliente : request.Role,
                OwnerId = request.OwnerId,
                EmployeeId = request.EmployeeId
            };

            var created = await _userService.CreateUserAsync(user, request.Password);
            return CreatedAtAction(nameof(GetById), new { uuid = created.Uuid }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] UpdateUserRequestDto request)
    {
        try
        {
            var user = new User
            {
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                OwnerId = request.OwnerId,
                EmployeeId = request.EmployeeId,
                IsActive = request.IsActive
            };

            var updated = await _userService.UpdateUserAsync(uuid, user, request.Password);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Usuario no encontrado." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var deleted = await _userService.DeleteUserAsync(uuid);
        if (!deleted) return NotFound(new { message = "Usuario no encontrado." });
        return NoContent();
    }
}
