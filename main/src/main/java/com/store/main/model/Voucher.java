package com.store.main.model;

import com.store.main.model.enums.VoucherType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing a discount voucher/coupon.
 * Vouchers can provide percentage or fixed amount discounts with minimum spend requirements.
 */
@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherType type;

    /**
     * Discount value. Interpretation depends on type:
     * - PERCENT: percentage value (e.g., 10 for 10%)
     * - FIXED: fixed amount in currency (e.g., 10.00 for $10 off)
     */
    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    /**
     * Minimum order amount required to apply this voucher.
     */
    @PositiveOrZero
    @Column(name = "min_spend", nullable = false, precision = 10, scale = 2)
    private BigDecimal minSpend = BigDecimal.ZERO;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    /**
     * Check if this voucher is currently valid (not expired).
     */
    public boolean isValid() {
        return LocalDate.now().isBefore(expiryDate) || LocalDate.now().isEqual(expiryDate);
    }
}
