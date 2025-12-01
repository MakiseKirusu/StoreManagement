package com.store.main.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.store.main.model.Order;
import com.store.main.model.User;
import com.store.main.model.enums.OrderStatus;

//Repository to manage Order entities
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +"FROM Order o JOIN o.items oi " +"WHERE o.user.id = :userId " +"AND oi.product.id = :productId " +"AND o.status = 'SHIPPED'")
    Boolean existsByUserIdAndProductIdAndStatusShipped(
        @Param("userId") Long userId,
        @Param("productId") Long productId
    );
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
