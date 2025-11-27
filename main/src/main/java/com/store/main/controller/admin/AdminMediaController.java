package com.store.main.controller.admin;

import com.store.main.exception.BadRequestException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Product;
import com.store.main.model.ProductMedia;
import com.store.main.model.enums.MediaType;
import com.store.main.repository.ProductMediaRepository;
import com.store.main.repository.ProductRepository;
import com.store.main.service.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing product media (images and videos)
 * Admin and Staff only
 */
@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Slf4j
public class AdminMediaController {

    private final SupabaseStorageService storageService;
    private final ProductRepository productRepository;
    private final ProductMediaRepository mediaRepository;

    /**
     * Upload a product image
     * POST /api/admin/media/products/{productId}/images
     */
    @PostMapping(value = "/products/{productId}/images", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder
    ) {
        try {
            // Verify product exists
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

            // Upload to Supabase Storage
            String imageUrl = storageService.uploadImage(file, productId);

            // Save to database
            ProductMedia media = new ProductMedia(product, MediaType.IMAGE, imageUrl, altText, displayOrder);
            ProductMedia savedMedia = mediaRepository.save(media);

            log.info("Image uploaded successfully for product {}: {}", productId, imageUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedMedia.getId());
            response.put("url", savedMedia.getUrl());
            response.put("mediaType", savedMedia.getMediaType());
            response.put("altText", savedMedia.getAltText());
            response.put("displayOrder", savedMedia.getDisplayOrder());
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to upload image for product {}", productId, e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload a product video
     * POST /api/admin/media/products/{productId}/videos
     */
    @PostMapping(value = "/products/{productId}/videos", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadVideo(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder
    ) {
        try {
            // Verify product exists
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

            // Upload to Supabase Storage
            String videoUrl = storageService.uploadVideo(file, productId);

            // Save to database
            ProductMedia media = new ProductMedia(product, MediaType.VIDEO, videoUrl, altText, displayOrder);
            ProductMedia savedMedia = mediaRepository.save(media);

            log.info("Video uploaded successfully for product {}: {}", productId, videoUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedMedia.getId());
            response.put("url", savedMedia.getUrl());
            response.put("mediaType", savedMedia.getMediaType());
            response.put("altText", savedMedia.getAltText());
            response.put("displayOrder", savedMedia.getDisplayOrder());
            response.put("message", "Video uploaded successfully");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to upload video for product {}", productId, e);
            throw new BadRequestException("Failed to upload video: " + e.getMessage());
        }
    }

    /**
     * Get all media for a product
     * GET /api/admin/media/products/{productId}
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<List<ProductMedia>> getProductMedia(@PathVariable Long productId) {
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }

        List<ProductMedia> media = mediaRepository.findByProduct_IdOrderByDisplayOrderAsc(productId);
        return ResponseEntity.ok(media);
    }

    /**
     * Delete a media file
     * DELETE /api/admin/media/{mediaId}
     */
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Map<String, String>> deleteMedia(@PathVariable Long mediaId) {
        ProductMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));

        try {
            // Delete from Supabase Storage
            storageService.deleteFile(media.getUrl());

            // Delete from database
            mediaRepository.delete(media);

            log.info("Media deleted successfully: {}", mediaId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Media deleted successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to delete media {}", mediaId, e);
            throw new BadRequestException("Failed to delete media: " + e.getMessage());
        }
    }

    /**
     * Update media metadata (alt text, display order)
     * PUT /api/admin/media/{mediaId}
     */
    @PutMapping("/{mediaId}")
    public ResponseEntity<ProductMedia> updateMedia(
            @PathVariable Long mediaId,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder
    ) {
        ProductMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));

        if (altText != null) {
            media.setAltText(altText);
        }

        if (displayOrder != null) {
            media.setDisplayOrder(displayOrder);
        }

        ProductMedia updatedMedia = mediaRepository.save(media);

        log.info("Media metadata updated: {}", mediaId);
        return ResponseEntity.ok(updatedMedia);
    }
}
