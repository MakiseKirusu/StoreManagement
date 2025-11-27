package com.store.main.repository;

import com.store.main.model.Notification;
import com.store.main.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Notification entity operations.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a specific user.
     * @param user the user entity
     * @param pageable pagination parameters
     * @return page of user's notifications
     */
    Page<Notification> findByUser(User user, Pageable pageable);

    /**
     * Find notifications for a user by read status.
     * @param user the user entity
     * @param isRead read status (true for read, false for unread)
     * @param pageable pagination parameters
     * @return page of notifications matching the criteria
     */
    Page<Notification> findByUserAndIsRead(User user, Boolean isRead, Pageable pageable);

    /**
     * Find unread notifications for a user ID.
     * @param userId the user ID
     * @return list of unread notifications
     */
    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    /**
     * Count unread notifications for a user.
     * @param userId the user ID
     * @return number of unread notifications
     */
    Long countByUserIdAndIsReadFalse(Long userId);
}
