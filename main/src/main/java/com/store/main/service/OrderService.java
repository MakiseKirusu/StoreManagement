package com.store.main.service;

import com.store.main.dto.request.CheckoutRequest;
import com.store.main.exception.BadRequestException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.*;
import com.store.main.model.enums.OrderStatus;
import com.store.main.model.enums.VoucherType;
import com.store.main.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
//Service to manage orders, handling checkout process and order management with transactional integrity
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final NotificationRepository notificationRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;

    /**
     * Process checkout from cart to create an order.
     * transactional operation:
     * 1. Validates cart and stock availability
     * 2. Applies voucher discount if provided
     * 3. Creates order and order items
     * 4. Deducts inventory
     * 5. Clears cart
     * 6. Creates notification
     */
    @Transactional
    public Order checkout(String username, CheckoutRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Cart cart = cartService.getCart(username);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cartService.calculateCartTotal(cart);

        BigDecimal discount = BigDecimal.ZERO;
        Voucher voucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher", "code", request.getVoucherCode()));

            if (!voucher.isValid()) {
                throw new BadRequestException("Voucher has expired");
            }

            if (subtotal.compareTo(voucher.getMinSpend()) < 0) {
                throw new BadRequestException(
                    String.format("Minimum spend of %.2f required for this voucher", voucher.getMinSpend()));
            }

            if (voucher.getType() == VoucherType.PERCENT) {
                discount = subtotal.multiply(voucher.getValue())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            } else if (voucher.getType() == VoucherType.FIXED) {
                discount = voucher.getValue();
            }

            if (discount.compareTo(subtotal) > 0) {
                discount = subtotal;
            }
        }

        BigDecimal totalPrice = subtotal.subtract(discount);

        for (CartItem cartItem : cart.getItems()) {
            if (!inventoryService.hasStock(cartItem.getProduct().getId(), cartItem.getQuantity())) {
                throw new BadRequestException(
                    "Insufficient stock for product: " + cartItem.getProduct().getName());
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);
        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getProduct().getPrice());
            orderItemRepository.save(orderItem);

            inventoryService.removeStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }

        cartService.clearCart(username);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(String.format("Order #%d placed successfully! Total: $%.2f",
            savedOrder.getId(), totalPrice));
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return savedOrder;
    }
//Get all orders for a user
    public Page<Order> getUserOrders(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }
//Get a specific order by ID, validating if the order belongs to that user
    public Order getOrderById(String username, Long orderId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        // Ensure order belongs to user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied to this order");
        }

        return order;
    }
//Get all orders (admin)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
//Update order status (admin)
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
//Notification for status change/update
        Notification notification = new Notification();
        notification.setUser(order.getUser());
        notification.setMessage(String.format("Order #%d status updated to: %s",
            orderId, status.name()));
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return savedOrder;
    }
//Cancel an order, restoring inventory if order is in PENDING or PROCESSING status
    @Transactional
    public Order cancelOrder(String username, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getUsername().equals(username)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        //Only allow cancellation of PENDING or PROCESSING orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING) {
            throw new BadRequestException("Cannot cancel order in " + order.getStatus() + " status");
        }

        //Restore inventory
        for (OrderItem item : order.getItems()) {
            inventoryService.addStock(item.getProduct().getId(), item.getQuantity());
        }

        //Update status
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        //Create notification if status is changed/updated
        Notification notification = new Notification();
        notification.setUser(order.getUser());
        notification.setMessage(String.format("Order #%d has been cancelled", orderId));
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return savedOrder;
    }
}
