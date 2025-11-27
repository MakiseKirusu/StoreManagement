package com.store.main.service;

import com.store.main.dto.request.CategoryRequest;
import com.store.main.exception.DuplicateResourceException;
import com.store.main.exception.ResourceNotFoundException;
import com.store.main.model.Category;
import com.store.main.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing product categories.
 * Handles CRUD operations for categories.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Get all categories.
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Get a category by ID.
     */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    /**
     * Create a new category.
     */
    @Transactional
    public Category createCategory(CategoryRequest request) {
        // Check if category with same name already exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        Category category = new Category();
        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    /**
     * Update an existing category.
     */
    @Transactional
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryById(id);

        // Check if another category with the new name exists
        if (!category.getName().equals(request.getName()) &&
            categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        category.setName(request.getName());
        return categoryRepository.save(category);
    }

    /**
     * Delete a category by ID.
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
