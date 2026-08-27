using System.Security.Claims;
using LovelyPetShop.API.DTOs;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthController(IAuthService authService, IUserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Usuario y contraseña requeridos." });

        var result = await _authService.LoginAsync(request.UsernameOrEmail, request.Password);
        if (!result.Success || result.User == null || result.Token == null)
            return Unauthorized(new { message = result.ErrorMessage ?? "Credenciales inválidas." });

        return Ok(new AuthResponseDto
        {
            Token = result.Token,
            User = new UserInfoDto
            {
                Uuid = result.User.Uuid,
                Username = result.User.Username,
                Email = result.User.Email,
                FullName = result.User.FullName,
                Role = result.User.Role,
                OwnerId = result.User.OwnerId,
                EmployeeId = result.User.EmployeeId
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCustomerRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Todos los campos obligatorios deben ser completados." });

        var result = await _authService.RegisterCustomerAsync(
            request.Username,
            request.Email,
            request.Password,
            request.FullName,
            request.Phone,
            request.Address
        );

        if (!result.Success || result.User == null || result.Token == null)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(new AuthResponseDto
        {
            Token = result.Token,
            User = new UserInfoDto
            {
                Uuid = result.User.Uuid,
                Username = result.User.Username,
                Email = result.User.Email,
                FullName = result.User.FullName,
                Role = result.User.Role,
                OwnerId = result.User.OwnerId,
                EmployeeId = result.User.EmployeeId
            }
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userUuid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userUuid))
            return Unauthorized();

        var user = await _userService.GetUserByIdAsync(userUuid);
        if (user == null || !user.IsActive)
            return Unauthorized();

        return Ok(new UserInfoDto
        {
            Uuid = user.Uuid,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            OwnerId = user.OwnerId,
            EmployeeId = user.EmployeeId
        });
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedUsers()
    {
        await _authService.EnsureSeedUsersAsync();
        return Ok(new { message = "Usuarios semilla verificados correctamente." });
    }
}
