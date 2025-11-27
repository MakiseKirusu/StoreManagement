package com.store.main.repository;

import com.store.main.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Voucher entity operations.
 */
@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    /**
     * Find a voucher by its code.
     * @param code the voucher code
     * @return Optional containing the voucher if found
     */
    Optional<Voucher> findByCode(String code);

    /**
     * Check if a voucher code already exists.
     * @param code the voucher code to check
     * @return true if the code exists, false otherwise
     */
    Boolean existsByCode(String code);
}
