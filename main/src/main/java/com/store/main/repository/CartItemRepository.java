package com.store.main.repository;

import com.store.main.model.Cart;
import com.store.main.model.CartItem;
import com.store.main.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for CartItem entity operations.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Find a cart item by cart and product.
     * Used to check if a product is already in the cart.
     * @param cart the cart entity
     * @param product the product entity
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    /**
     * Delete all cart items for a specific cart.
     * @param cart the cart entity
     */
    void deleteByCart(Cart cart);
}
