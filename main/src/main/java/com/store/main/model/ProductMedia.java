package com.store.main.model;

import com.store.main.model.enums.MediaType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing product media (images and videos).
 * Supports multiple media files per product with ordering.
 */
@Entity
@Table(name = "product_media", indexes = {
    @Index(name = "idx_product_media_product_id", columnList = "product_id"),
    @Index(name = "idx_product_media_order", columnList = "product_id,display_order"),
    @Index(name = "idx_product_media_type", columnList = "product_id,media_type")
})
@Data
@NoArgsConstructor
public class ProductMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    @NotNull
    private MediaType mediaType;

    @Column(name = "url", nullable = false, length = 500)
    @NotNull
    @Size(max = 500)
    private String url;

    @Column(name = "alt_text", length = 200)
    @Size(max = 200)
    private String altText;

    @Column(name = "display_order", nullable = false)
    @NotNull
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Constructor for creating new product media
     */
    public ProductMedia(Product product, MediaType mediaType, String url, String altText, Integer displayOrder) {
        this.product = product;
        this.mediaType = mediaType;
        this.url = url;
        this.altText = altText;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
