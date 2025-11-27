package com.store.main.repository;

import com.store.main.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for OrderItem entity operations.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Basic CRUD operations are inherited from JpaRepository
    // Additional custom methods can be added here if needed
}
