using System.Text.Json.Serialization;

namespace LovelyPetShop.Domain.Entities;

public class Product
{
    [JsonPropertyName("uuid")]
    public string Uuid { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("sku")]
    public string SKU { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty; // Alimentos, Medicamentos/Insumos, Accesorios, Higiene, Juguetes

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [JsonPropertyName("price")]
    public decimal Price { get; set; } // Precio de venta final al cliente

    [JsonPropertyName("cost_price")]
    public decimal CostPrice { get; set; } // Costo interno para administración

    [JsonPropertyName("stock_quantity")]
    public int StockQuantity { get; set; }

    [JsonPropertyName("supplier")]
    public string Supplier { get; set; } = string.Empty;

    [JsonPropertyName("is_commercial")]
    public bool IsCommercial { get; set; } = true; // True: visible en tienda de clientes; False: insumo médico interno

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product() { }

    public Product(string name, string sku, string category, decimal price, int stockQuantity, string supplier, string description = "", string imageUrl = "", decimal costPrice = 0, bool isCommercial = true)
    {
        Uuid = Guid.NewGuid().ToString();
        Name = name;
        SKU = sku;
        Category = category;
        Price = price;
        StockQuantity = stockQuantity;
        Supplier = supplier;
        Description = description;
        ImageUrl = imageUrl;
        CostPrice = costPrice;
        IsCommercial = isCommercial;
        CreatedAt = DateTime.UtcNow;
    }
}
