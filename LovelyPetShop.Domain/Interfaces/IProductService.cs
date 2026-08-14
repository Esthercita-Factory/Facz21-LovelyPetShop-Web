using LovelyPetShop.Domain.Entities;

namespace LovelyPetShop.Domain.Interfaces;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(string uuid);
    Task<Product?> GetProductBySkuAsync(string sku);
    Task<Product> CreateProductAsync(Product product);
    Task<Product> UpdateProductAsync(string uuid, Product product);
    Task<bool> DeleteProductAsync(string uuid);
}
