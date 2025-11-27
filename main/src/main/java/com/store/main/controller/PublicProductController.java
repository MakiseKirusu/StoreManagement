package com.store.main.controller;

import com.store.main.dto.response.ProductResponse;
import com.store.main.model.Category;
import com.store.main.model.Inventory;
import com.store.main.model.Product;
import com.store.main.service.CategoryService;
import com.store.main.service.InventoryService;
import com.store.main.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public controller for browsing products and categories.
 * Accessible to all users without authentication.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final InventoryService inventoryService;

    // ==================== Categories ====================

    /**
     * Get all categories.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get a category by ID.
     */
    @GetMapping("/categories/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    // ==================== Products ====================

    /**
     * Get all products with pagination.
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(Pageable pageable) {
        Page<Product> products = productService.getAllProducts(pageable);
        Page<ProductResponse> response = products.map(ProductResponse::fromProduct);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a product by ID.
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        ProductResponse response = ProductResponse.fromProduct(product);
        return ResponseEntity.ok(response);
    }

    /**
     * Get products by category.
     */
    @GetMapping("/categories/{categoryId}/products")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            Pageable pageable) {
        Page<Product> products = productService.getProductsByCategory(categoryId, pageable);
        Page<ProductResponse> response = products.map(ProductResponse::fromProduct);
        return ResponseEntity.ok(response);
    }

    /**
     * Search products with filters.
     */
    @GetMapping("/products/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable) {
        Page<Product> products = productService.searchProducts(
                name, categoryId, minPrice, maxPrice, pageable);
        Page<ProductResponse> response = products.map(ProductResponse::fromProduct);
        return ResponseEntity.ok(response);
    }

    /**
     * Get product inventory/stock availability.
     */
    @GetMapping("/products/{productId}/inventory")
    public ResponseEntity<Inventory> getProductInventory(@PathVariable Long productId) {
        Inventory inventory = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(inventory);
    }
}
