package com.store.main.service;

import com.store.main.dto.request.ProductRequest;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Category;
import com.store.main.model.Inventory;
import com.store.main.model.Product;
import com.store.main.repository.InventoryRepository;
import com.store.main.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service for managing products.
 * Handles CRUD operations and search functionality.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryService categoryService;

    /**
     * Get all products with pagination.
     */
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Get a product by ID.
     */
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    /**
     * Search products by name, category, and price range.
     */
    public Page<Product> searchProducts(
            String name,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {

        // Set default values if not provided
        if (minPrice == null) minPrice = BigDecimal.ZERO;
        if (maxPrice == null) maxPrice = new BigDecimal("999999.99");

        return productRepository.searchProducts(name, categoryId, minPrice, maxPrice, pageable);
    }

    /**
     * Get products by category.
     */
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        Category category = categoryService.getCategoryById(categoryId);
        return productRepository.findByCategory(category, pageable);
    }

    /**
     * Create a new product with inventory.
     */
    @Transactional
    public Product createProduct(ProductRequest request) {
        // Get the category
        Category category = categoryService.getCategoryById(request.getCategoryId());

        // Create product
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        // Create inventory for the product
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setStockQuantity(0); // Default quantity is 0
        inventoryRepository.save(inventory);

        return savedProduct;
    }

    /**
     * Update an existing product.
     */
    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        Category category = categoryService.getCategoryById(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        return productRepository.save(product);
    }

    /**
     * Delete a product by ID.
     * This will also delete the associated inventory due to cascade settings.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
