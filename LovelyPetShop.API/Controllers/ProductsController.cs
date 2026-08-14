using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LovelyPetShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllProductsAsync();
        return Ok(result);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> Get(string uuid)
    {
        var result = await _service.GetProductByIdAsync(uuid);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("sku/{sku}")]
    public async Task<IActionResult> GetBySku(string sku)
    {
        var result = await _service.GetProductBySkuAsync(sku);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        try
        {
            var created = await _service.CreateProductAsync(product);
            return CreatedAtAction(nameof(Get), new { uuid = created.Uuid }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{uuid}")]
    public async Task<IActionResult> Update(string uuid, [FromBody] Product product)
    {
        try
        {
            var updated = await _service.UpdateProductAsync(uuid, product);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var deleted = await _service.DeleteProductAsync(uuid);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
