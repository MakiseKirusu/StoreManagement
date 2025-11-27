package com.store.main.repository;

import com.store.main.model.Inventory;
import com.store.main.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Inventory entity operations.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    /**
     * Find inventory record by product.
     * @param product the product entity
     * @return Optional containing the inventory if found
     */
    Optional<Inventory> findByProduct(Product product);

    /**
     * Find inventory record by product ID.
     * @param productId the product ID
     * @return Optional containing the inventory if found
     */
    Optional<Inventory> findByProductId(Long productId);
}
