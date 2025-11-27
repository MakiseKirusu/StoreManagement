package com.store.main.repository;

import com.store.main.model.Product;
import com.store.main.model.Review;
import com.store.main.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Review entity operations.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all reviews for a specific product.
     * @param product the product entity
     * @param pageable pagination parameters
     * @return page of reviews for the product
     */
    Page<Review> findByProduct(Product product, Pageable pageable);

    /**
     * Find all reviews for a specific product ordered by creation date.
     */
    Page<Review> findByProductOrderByCreatedAtDesc(Product product, Pageable pageable);

    /**
     * Find all reviews by a user ordered by creation date.
     */
    Page<Review> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Find all reviews for a specific product ID.
     * @param productId the product ID
     * @param pageable pagination parameters
     * @return page of reviews for the product
     */
    Page<Review> findByProductId(Long productId, Pageable pageable);

    /**
     * Calculate the average rating for a product.
     * @param productId the product ID
     * @return the average rating (1-5), or null if no reviews exist
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * Alias for average rating method.
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * Check if a user has already reviewed a product.
     * @param userId the user ID
     * @param productId the product ID
     * @return true if a review exists, false otherwise
     */
    Boolean existsByUserIdAndProductId(Long userId, Long productId);

    /**
     * Check if a user has already reviewed a product (entity-based).
     */
    Boolean existsByUserAndProduct(User user, Product product);
}
