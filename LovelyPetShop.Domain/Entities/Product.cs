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
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("price")]
    public decimal Price { get; set; }

    [JsonPropertyName("stock_quantity")]
    public int StockQuantity { get; set; }

    [JsonPropertyName("supplier")]
    public string Supplier { get; set; } = string.Empty;

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Product() { }

    public Product(string name, string sku, string category, decimal price, int stockQuantity, string supplier)
    {
        Uuid = Guid.NewGuid().ToString();
        Name = name;
        SKU = sku;
        Category = category;
        Price = price;
        StockQuantity = stockQuantity;
        Supplier = supplier;
        CreatedAt = DateTime.Now;
    }
}
