package com.store.main.service;

import com.store.main.exception.BadRequestException;
import com.store.main.exception.InsufficientStockException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Inventory;
import com.store.main.model.Product;
import com.store.main.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
//Service to manage product inventory, handling stock tracking and updates
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductService productService;
//Get inventory by product ID
    public Inventory getInventoryByProductId(Long productId) {
        Product product = productService.getProductById(productId);
        return inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Inventory", "product_id", productId));
    }
//Update quantity for a product
    @Transactional
    public Inventory updateInventoryQuantity(Long productId, Integer quantity) {
        if (quantity < 0) {
            throw new BadRequestException("Quantity cannot be negative");
        }

        Inventory inventory = getInventoryByProductId(productId);
        inventory.setStockQuantity(quantity);
        return inventoryRepository.save(inventory);
    }
//Add stock to inventory
    @Transactional
    public Inventory addStock(Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity to add must be positive");
        }

        Inventory inventory = getInventoryByProductId(productId);
        inventory.setStockQuantity(inventory.getStockQuantity() + quantity);
        return inventoryRepository.save(inventory);
    }
//Remove stock from inventory, used during order processing
    @Transactional
    public Inventory removeStock(Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity to remove must be positive");
        }

        Inventory inventory = getInventoryByProductId(productId);

        if (inventory.getStockQuantity() < quantity) {
            throw new InsufficientStockException(
                    inventory.getProduct().getName(),
                    quantity,
                    inventory.getStockQuantity());
        }

        inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
        return inventoryRepository.save(inventory);
    }
//Check if the sufficient stock is available
    public boolean hasStock(Long productId, Integer requiredQuantity) {
        try {
            Inventory inventory = getInventoryByProductId(productId);
            return inventory.getStockQuantity() >= requiredQuantity;
        } catch (ResourceNotFoundException e) {
            return false;
        }
    }
}
