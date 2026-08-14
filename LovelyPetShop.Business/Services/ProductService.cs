using LovelyPetShop.Domain.Entities;
using LovelyPetShop.Domain.Interfaces;

namespace LovelyPetShop.Business.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Product?> GetProductByIdAsync(string uuid)
    {
        return await _repository.GetByUuidAsync(uuid);
    }

    public async Task<Product?> GetProductBySkuAsync(string sku)
    {
        return await _repository.GetBySkuAsync(sku);
    }

    public async Task<Product> CreateProductAsync(Product product)
    {
        var existing = await _repository.GetBySkuAsync(product.SKU);
        if (existing != null)
            throw new ArgumentException("Ya existe un producto con el mismo SKU.");

        await _repository.AddAsync(product);
        return product;
    }

    public async Task<Product> UpdateProductAsync(string uuid, Product product)
    {
        var existing = await _repository.GetByUuidAsync(uuid);
        if (existing == null)
            throw new KeyNotFoundException("Producto no encontrado.");

        product.Uuid = uuid;
        await _repository.UpdateAsync(product);
        return product;
    }

    public async Task<bool> DeleteProductAsync(string uuid)
    {
        return await _repository.DeleteByUuidAsync(uuid);
    }
}
