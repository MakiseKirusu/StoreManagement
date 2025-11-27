package com.store.main.repository;

import com.store.main.model.Cart;
import com.store.main.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Cart entity operations.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Find a cart by user.
     * @param user the user entity
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUser(User user);

    /**
     * Find a cart by user ID.
     * @param userId the user ID
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUserId(Long userId);

    /**
     * Find a cart by user with items eagerly loaded.
     * @param user the user entity
     * @return Optional containing the cart with items loaded
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user = :user")
    Optional<Cart> findByUserWithItems(@Param("user") User user);

    /**
     * Find a cart by ID with items eagerly loaded.
     * @param id the cart ID
     * @return Optional containing the cart with items loaded
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.id = :id")
    Optional<Cart> findByIdWithItems(@Param("id") Long id);
}
