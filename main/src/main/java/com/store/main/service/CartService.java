package com.store.main.service;

import com.store.main.dto.request.CartItemRequest;
import com.store.main.exception.BadRequestException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Cart;
import com.store.main.model.CartItem;
import com.store.main.model.Product;
import com.store.main.model.User;
import com.store.main.repository.CartItemRepository;
import com.store.main.repository.CartRepository;
import com.store.main.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service for managing shopping carts.
 * Handles adding, removing, and updating cart items.
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Get or create a cart for the user.
     */
    @Transactional
    public Cart getOrCreateCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return cartRepository.findByUserWithItems(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    /**
     * Get the user's cart.
     */
    public Cart getCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "user", username));
    }

    /**
     * Add an item to the cart or update quantity if it already exists.
     */
    @Transactional
    public Cart addItemToCart(String username, CartItemRequest request) {
        // Validate quantity
        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be positive");
        }

        // Get or create cart
        Cart cart = getOrCreateCart(username);

        // Get product and check stock
        Product product = productService.getProductById(request.getProductId());

        if (!inventoryService.hasStock(product.getId(), request.getQuantity())) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }

        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            // Check stock for new quantity
            if (!inventoryService.hasStock(product.getId(), newQuantity)) {
                throw new BadRequestException("Insufficient stock. Available: " +
                    inventoryService.getInventoryByProductId(product.getId()).getStockQuantity());
            }

            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Create new cart item and establish bidirectional relationship
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());

            // Add to cart's collection (maintain bidirectional relationship)
            cart.getItems().add(cartItem);

            // Save through cart (cascade will handle cart item)
            cartRepository.save(cart);
        }

        // Return fresh cart with items
        return cartRepository.findByIdWithItems(cart.getId()).orElseThrow(
            () -> new ResourceNotFoundException("Cart", "id", cart.getId())
        );
    }

    /**
     * Update the quantity of a cart item.
     */
    @Transactional
    public Cart updateCartItemQuantity(String username, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be positive");
        }

        Cart cart = getCart(username);
        Product product = productService.getProductById(productId);

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "productId", productId));

        // Check stock
        if (!inventoryService.hasStock(productId, quantity)) {
            throw new BadRequestException("Insufficient stock. Available: " +
                inventoryService.getInventoryByProductId(productId).getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return cart;
    }

    /**
     * Remove an item from the cart.
     */
    @Transactional
    public Cart removeItemFromCart(String username, Long productId) {
        Cart cart = getCart(username);
        Product product = productService.getProductById(productId);

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "productId", productId));

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        return cartRepository.save(cart);
    }

    /**
     * Clear all items from the cart.
     */
    @Transactional
    public void clearCart(String username) {
        Cart cart = getCart(username);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    /**
     * Calculate the total price of the cart.
     */
    public BigDecimal calculateCartTotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
