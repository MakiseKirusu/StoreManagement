package com.store.main.dto.request;

import com.store.main.model.enums.VoucherType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating/updating vouchers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherRequest {

    @NotBlank(message = "Voucher code is required")
    @Size(max = 50, message = "Voucher code must not exceed 50 characters")
    private String code;

    @NotNull(message = "Voucher type is required")
    private VoucherType type;

    @NotNull(message = "Value is required")
    @Positive(message = "Value must be positive")
    private Double value;

    @PositiveOrZero(message = "Minimum spend must be zero or positive")
    private Double minSpend = 0.0;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
}
