package com.store.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.store.main.model.Product;
import com.store.main.model.ProductMedia;
import com.store.main.model.enums.MediaType;
//Repository to manage ProductMedia entities
@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, Long> {
//Find all media for a specific product, ordered by display_order
    List<ProductMedia> findByProductOrderByDisplayOrderAsc(Product product);
//Find all media for a specific product ID, ordered by display_order
    List<ProductMedia> findByProduct_IdOrderByDisplayOrderAsc(Long productId);
//Find media by product and media type, ordered by display_order
    List<ProductMedia> findByProductAndMediaTypeOrderByDisplayOrderAsc(Product product, MediaType mediaType);
//Find images to display product
    List<ProductMedia> findByProduct_IdAndMediaTypeOrderByDisplayOrderAsc(Long productId, MediaType mediaType);
//Delete media for a product
    void deleteByProduct(Product product);
//Delete all media for a product ID
    void deleteByProduct_Id(Long productId);
//Count media files for a product ID
    Long countByProduct_Id(Long productId);
//Check if the product has any media
    boolean existsByProduct_Id(Long productId);
}
