package com.store.main.repository;

import com.store.main.model.Product;
import com.store.main.model.ProductMedia;
import com.store.main.model.enums.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ProductMedia entity operations
 */
@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, Long> {

    /**
     * Find all media for a specific product, ordered by display_order
     */
    List<ProductMedia> findByProductOrderByDisplayOrderAsc(Product product);

    /**
     * Find all media for a specific product ID, ordered by display_order
     */
    List<ProductMedia> findByProduct_IdOrderByDisplayOrderAsc(Long productId);

    /**
     * Find media by product and media type
     */
    List<ProductMedia> findByProductAndMediaTypeOrderByDisplayOrderAsc(Product product, MediaType mediaType);

    /**
     * Find images only for a product
     */
    List<ProductMedia> findByProduct_IdAndMediaTypeOrderByDisplayOrderAsc(Long productId, MediaType mediaType);

    /**
     * Delete all media for a product
     */
    void deleteByProduct(Product product);

    /**
     * Delete all media for a product ID
     */
    void deleteByProduct_Id(Long productId);

    /**
     * Count media files for a product
     */
    Long countByProduct_Id(Long productId);

    /**
     * Check if product has any media
     */
    boolean existsByProduct_Id(Long productId);
}
