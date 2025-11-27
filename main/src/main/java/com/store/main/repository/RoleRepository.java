package com.store.main.repository;

import com.store.main.model.Role;
import com.store.main.model.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /**
     * Find a role by its name.
     * @param name the role name enum
     * @return Optional containing the role if found
     */
    Optional<Role> findByName(ERole name);
}
