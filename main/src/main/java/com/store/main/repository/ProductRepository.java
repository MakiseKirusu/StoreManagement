package com.store.main.repository;

import com.store.main.model.Category;
import com.store.main.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Product entity operations.
 * Includes search and filter capabilities.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Search products by name (case-insensitive).
     * @param name the search term
     * @param pageable pagination parameters
     * @return page of matching products
     */
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Find all products in a specific category.
     * @param categoryId the category ID
     * @param pageable pagination parameters
     * @return page of products in the category
     */
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    /**
     * Find all products by category.
     * @param category the category entity
     * @param pageable pagination parameters
     * @return page of products in the category
     */
    Page<Product> findByCategory(Category category, Pageable pageable);

    /**
     * Find products within a price range.
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination parameters
     * @return page of products within the price range
     */
    Page<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    /**
     * Advanced search: filter by category and price range.
     * @param categoryId optional category ID
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination parameters
     * @return page of filtered products
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByCriteria(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    /**
     * Search products with filters (name, category, price range).
     * @param name search term for product name
     * @param categoryId optional category ID
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination parameters
     * @return page of filtered products
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> searchProducts(
        @Param("name") String name,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );
}
