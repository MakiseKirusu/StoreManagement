package com.store.main.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for checkout/order creation requests.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    /**
     * Optional voucher code to apply discount.
     */
    private String voucherCode;
}
