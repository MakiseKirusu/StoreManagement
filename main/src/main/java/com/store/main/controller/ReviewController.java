package com.store.main.controller;

import com.store.main.dto.request.ReviewRequest;
import com.store.main.model.Review;
import com.store.main.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for product reviews.
 * Handles creating, viewing, and deleting reviews with purchase verification.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a review for a product (requires verified purchase).
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        Review review = reviewService.createReview(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    /**
     * Get all reviews for a specific product (public endpoint).
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<Review>> getProductReviews(
            @PathVariable Long productId,
            Pageable pageable) {
        Page<Review> reviews = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get average rating for a product (public endpoint).
     */
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long productId) {
        Double avgRating = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(avgRating != null ? avgRating : 0.0);
    }

    /**
     * Get user's own reviews.
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<Review>> getUserReviews(
            Pageable pageable,
            Authentication authentication) {
        String username = authentication.getName();
        Page<Review> reviews = reviewService.getUserReviews(username, pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Delete a review.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        reviewService.deleteReview(username, id);
        return ResponseEntity.noContent().build();
    }
}
