package com.store.main.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing product inventory/stock levels.
 * Each product has one inventory record tracking available stock quantity.
 */
@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @PositiveOrZero
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    public Inventory(Product product, Integer stockQuantity) {
        this.product = product;
        this.stockQuantity = stockQuantity;
    }
}
