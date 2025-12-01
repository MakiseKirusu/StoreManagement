package com.store.main.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.store.main.dto.request.ReviewRequest;
import com.store.main.exception.BadRequestException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Order;
import com.store.main.model.Product;
import com.store.main.model.Review;
import com.store.main.model.User;
import com.store.main.model.enums.OrderStatus;
import com.store.main.repository.OrderRepository;
import com.store.main.repository.ProductRepository;
import com.store.main.repository.ReviewRepository;
import com.store.main.repository.UserRepository;

import lombok.RequiredArgsConstructor;
//Service to manage product reviews, implementing purchase verification
@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
//Create a review for a product, verifies the buyer's product
    @Transactional
    public Review createReview(String username, ReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        //Check if the user has this product purchased and recieved
        boolean hasPurchased = verifyPurchase(user, product);

        if (!hasPurchased) {
            throw new BadRequestException(
                "You can only review products you have purchased and received");
        }

        //Check if the user has already reviewed the product
        if (reviewRepository.existsByUserAndProduct(user, product)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        //Rating validation
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        //Create review
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsVerifiedPurchase(true);  // Mark as verified since purchase was verified

        return reviewRepository.save(review);
    }
//Verify that the user has purchased and recieved the product, only orders with status shipped/delivered are counted as verified purchases
    private boolean verifyPurchase(User user, Product product) {
        Page<Order> userOrders = orderRepository.findByUserOrderByCreatedAtDesc(
            user,
            Pageable.unpaged()
        );

        return userOrders.stream()
            .filter(order -> order.getStatus() == OrderStatus.SHIPPED ||
                           order.getStatus() == OrderStatus.DELIVERED)
            .flatMap(order -> order.getItems().stream())
            .anyMatch(orderItem -> orderItem.getProduct().getId().equals(product.getId()));
    }

    //Get reviews for a product
    public Page<Review> getProductReviews(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return reviewRepository.findByProductOrderByCreatedAtDesc(product, pageable);
    }

    //Get reviews by a user
    public Page<Review> getUserReviews(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return reviewRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }
//Delete a review, only the review author can delete their own review
    @Transactional
    public void deleteReview(String username, Long reviewId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
//check if user owns the review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }
//calculate average rating for a product
    public Double getAverageRating(Long productId) {
        return reviewRepository.findAverageRatingByProductId(productId);
    }
}
