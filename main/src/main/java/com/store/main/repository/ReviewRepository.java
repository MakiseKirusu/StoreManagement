package com.store.main.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.store.main.model.Product;
import com.store.main.model.Review;
import com.store.main.model.User;
//Repository to manage Review entities
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProduct(Product product, Pageable pageable);
//Find reviews for a specific product ordered by creation date
    Page<Review> findByProductOrderByCreatedAtDesc(Product product, Pageable pageable);
//Find all reviews by a specific user ordered by creatio date
    Page<Review> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Page<Review> findByProductId(Long productId, Pageable pageable);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
//Alias for average rating method
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);
    Boolean existsByUserIdAndProductId(Long userId, Long productId);
    Boolean existsByUserAndProduct(User user, Product product);
}
