package com.store.main.repository;

import com.store.main.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Category entity operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find a category by its name.
     * @param name the category name
     * @return Optional containing the category if found
     */
    Optional<Category> findByName(String name);

    /**
     * Check if a category name already exists.
     * @param name the category name to check
     * @return true if the name exists, false otherwise
     */
    Boolean existsByName(String name);
}
