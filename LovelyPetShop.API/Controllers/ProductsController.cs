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

    /// <summary>
    /// Catálogo público o para clientes con productos comerciales y precio final.
    /// </summary>
    [HttpGet("catalog")]
    public async Task<IActionResult> GetCatalog([FromQuery] string? category)
    {
        var all = await _service.GetAllProductsAsync();
        var commercial = all.Where(p => p.IsCommercial);

        if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "todos")
        {
            commercial = commercial.Where(p => string.Equals(p.Category, category, StringComparison.OrdinalIgnoreCase));
        }

        var result = commercial.Select(p => new
        {
            p.Uuid,
            p.Name,
            p.SKU,
            p.Category,
            p.Description,
            p.ImageUrl,
            p.Price, // Precio final al cliente
            InStock = p.StockQuantity > 0,
            p.StockQuantity
        });

        return Ok(result);
    }

    /// <summary>
    /// Listado completo interno para personal médico y administrativo (incluye insumos médicos y stock).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? onlyCommercial, [FromQuery] string? category)
    {
        var result = await _service.GetAllProductsAsync();

        if (onlyCommercial.HasValue)
        {
            result = result.Where(p => p.IsCommercial == onlyCommercial.Value);
        }

        if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "todos")
        {
            result = result.Where(p => string.Equals(p.Category, category, StringComparison.OrdinalIgnoreCase));
        }

        return Ok(result);
    }

    [HttpGet("{uuid}")]
    public async Task<IActionResult> Get(string uuid)
    {
        var result = await _service.GetProductByIdAsync(uuid);
        if (result == null) return NotFound(new { message = "Producto no encontrado." });
        return Ok(result);
    }

    [HttpGet("sku/{sku}")]
    public async Task<IActionResult> GetBySku(string sku)
    {
        var result = await _service.GetProductBySkuAsync(sku);
        if (result == null) return NotFound(new { message = "Producto no encontrado." });
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
            return NotFound(new { message = "Producto no encontrado." });
        }
    }

    [HttpDelete("{uuid}")]
    public async Task<IActionResult> Delete(string uuid)
    {
        var deleted = await _service.DeleteProductAsync(uuid);
        if (!deleted) return NotFound(new { message = "Producto no encontrado." });
        return NoContent();
    }
}
