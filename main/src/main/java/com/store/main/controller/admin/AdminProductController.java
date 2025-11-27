package com.store.main.controller.admin;

import com.store.main.dto.request.ProductRequest;
import com.store.main.dto.response.MessageResponse;
import com.store.main.model.Inventory;
import com.store.main.model.Product;
import com.store.main.service.InventoryService;
import com.store.main.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Admin controller for managing products and inventory.
 * Only accessible by users with ADMIN or STAFF roles.
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;

    /**
     * Get all products with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(Pageable pageable) {
        Page<Product> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by filters.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable) {
        Page<Product> products = productService.searchProducts(
                name, categoryId, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(products);
    }

    /**
     * Get a product by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Create a new product.
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * Update an existing product.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Product product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    /**
     * Delete a product by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }

    // ==================== Inventory Management ====================

    /**
     * Get inventory for a product.
     */
    @GetMapping("/{productId}/inventory")
    public ResponseEntity<Inventory> getInventory(@PathVariable Long productId) {
        Inventory inventory = inventoryService.getInventoryByProductId(productId);
        return ResponseEntity.ok(inventory);
    }

    /**
     * Update inventory quantity (set absolute quantity).
     */
    @PutMapping("/{productId}/inventory")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        Inventory inventory = inventoryService.updateInventoryQuantity(productId, quantity);
        return ResponseEntity.ok(inventory);
    }

    /**
     * Add stock to inventory (increment quantity).
     */
    @PostMapping("/{productId}/inventory/add")
    public ResponseEntity<Inventory> addStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        Inventory inventory = inventoryService.addStock(productId, quantity);
        return ResponseEntity.ok(inventory);
    }

    /**
     * Remove stock from inventory (decrement quantity).
     */
    @PostMapping("/{productId}/inventory/remove")
    public ResponseEntity<Inventory> removeStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        Inventory inventory = inventoryService.removeStock(productId, quantity);
        return ResponseEntity.ok(inventory);
    }
}
