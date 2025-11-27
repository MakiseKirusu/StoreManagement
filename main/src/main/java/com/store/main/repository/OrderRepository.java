package com.store.main.repository;

import com.store.main.model.Order;
import com.store.main.model.User;
import com.store.main.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Order entity operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find all orders for a specific user.
     * @param user the user entity
     * @param pageable pagination parameters
     * @return page of user's orders
     */
    Page<Order> findByUser(User user, Pageable pageable);

    /**
     * Find all orders for a specific user, ordered by creation date descending.
     * @param user the user entity
     * @param pageable pagination parameters
     * @return page of user's orders sorted by newest first
     */
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Find all orders for a specific user ID.
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return page of user's orders
     */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    /**
     * Find orders by status.
     * @param status the order status
     * @param pageable pagination parameters
     * @return page of orders with the specified status
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    /**
     * Check if a user has any shipped orders containing a specific product.
     * Used for verified purchase validation in reviews.
     * @param userId the user ID
     * @param productId the product ID
     * @return true if the user has purchased the product, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
           "FROM Order o JOIN o.items oi " +
           "WHERE o.user.id = :userId " +
           "AND oi.product.id = :productId " +
           "AND o.status = 'SHIPPED'")
    Boolean existsByUserIdAndProductIdAndStatusShipped(
        @Param("userId") Long userId,
        @Param("productId") Long productId
    );

    /**
     * Find order by ID with items eagerly loaded.
     * Used for operations that need to access order items (like cancellation).
     * @param id the order ID
     * @return optional containing the order with items, or empty if not found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
